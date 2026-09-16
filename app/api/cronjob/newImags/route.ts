import { NextResponse , NextRequest } from "next/server";
import { db } from "@/app/lib/drizzle";
import { field as fieldDB , crop, avgPixelValue} from "@/db/schema";
import { supabase } from "@/app/lib/supabase";
import { sentinel_image , sentinel_catalog } from "@/app/utils/sentinel";
import { fromPostgresPolygon } from "@/app/utils/coordinate";
import { eq, sql } from "drizzle-orm";
import { ImageType } from "@/app/types";
import { getAverageRampValueFromUrl_Server } from "@/app/actions/actions";
import { getColorRamp } from "@/app/utils/colorRamp";

export async function GET(req : NextRequest) {
    
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', {
        status: 401,
        });
    }
    const fields = await db.query.field.findMany({
        columns : {
            id : true,
            coordinates : true,
            imagesDates : true,
        },
        with : {
            crop : {
                columns : {
                    name : true,
                    planted_at : true
                }
            }
        }
    });

    const errors : string[] = [];

    for(const field of fields) {
        console.log("start" , field.id);
        try {
            const coor = fromPostgresPolygon(field.coordinates);
            // change coordinates to lat/lng to lng/lat
            const res = await sentinel_catalog({coordinates : coor.map((c : number[]) => [c[1], c[0]])})
            if(res.err) {
                console.log(res.err);
                errors.push(`${field.id}: catalog ${res.err}`);
                continue;
            }
    
            const dates = res.data.features.map((f : any) => f.properties.datetime);
            dates.sort((a:string, b:string) => new Date(b).getTime() - new Date(a).getTime());
            if (dates.length === 0) {
                console.log("no dates found" , field.id);
                continue;
            }
            console.log(dates[0] , "\n" , field.imagesDates);
            if(field.imagesDates.includes(dates[0])) {
                console.log("already done" , field.id);
                continue;
            }

            const fieldPixelValues : {fieldId : string , imageType : ImageType , imageDate : string , value : number|null}[] = [];
            const uploadedPaths : string[] = [];
    
            for(const to  of ["waterRequirement" , "nitrogenRequirement" , "phosphorusRequirement" , "cropStress"] as ImageType[]) {
                const res = await sentinel_image({coordinates : coor.map((c : number[]) => [c[1], c[0]]) , date:dates[0]  , imageType : to , crop : field.crop[0].name , plantingDate : field.crop[0].planted_at})
                    
                if(res.err || res.data === null) {
                    console.log(res.err);
                    errors.push(`${field.id}/${dates[0]}/${to}: image ${res.err ?? "no data"}`);
                    continue;
                }
                const { data, error } = await supabase.storage
                    .from("field")
                    .upload(`${field.id}/${dates[0]}/${to}.png`, res.data, {
                        cacheControl: '3600', 
                        contentType: 'image/png', 
                        upsert: true, 
                    });
                
                if (error) {
                    console.error('Error uploading image:', error.message);
                    errors.push(`${field.id}/${dates[0]}/${to}: upload ${error.message}`);
                    continue;
                }
                uploadedPaths.push(`${field.id}/${dates[0]}/${to}.png`);
                const rampRGB =  getColorRamp(field.crop[0].name , to , field.crop[0].planted_at , new Date(dates[0])).map(([value, intColor]) => {
                    const r = (intColor >> 16) & 255;
                    const g = (intColor >> 8) & 255;
                    const b = intColor & 255;
                    return { value, r, g, b };
                });
                let value : number | null = null;
                for (let attempt = 1; attempt <= 2; attempt++) {
                    try {
                        value = await getAverageRampValueFromUrl_Server(field.id , dates[0] , to , rampRGB)
                        break;
                    } catch (e : any) {
                        console.error('Error computing value:', e?.message ?? e);
                        await new Promise((r) => setTimeout(r, 1500));
                    }
                }
                if (value === null) errors.push(`${field.id}/${dates[0]}/${to}: value null (image uploaded but no valid pixels)`);
                fieldPixelValues.push({fieldId : field.id , imageType : to , imageDate : dates[0] , value : value})
                
                console.log("done" , to);
            }

            // Append the date only if ALL image types were uploaded, so a
            // date is never shown with only some of its images available.
            if (uploadedPaths.length === 4) {
                await db.update(fieldDB)
                    .set({
                        imagesDates: sql`array_append(${fieldDB.imagesDates}, ${dates[0]})`
                    })
                    .where(eq(fieldDB.id, field.id))
                if (fieldPixelValues.length != 0) await db.insert(avgPixelValue).values(fieldPixelValues)
                console.log("done" , field.id);
            } else {
                // All-or-none: remove the partial images we uploaded so the
                // date has no images at all, and don't append it.
                if (uploadedPaths.length > 0) {
                    const { error: removeError } = await supabase.storage
                        .from("field")
                        .remove(uploadedPaths);
                    if (removeError) console.error('Error removing partial images:', removeError.message);
                }
                console.log("skipped (incomplete images)" , field.id , dates[0] , uploadedPaths.length + "/4");
                errors.push(`${field.id}/${dates[0]}: only ${uploadedPaths.length}/4 images, date not appended, partials deleted`);
            }
        }catch(e){
            console.log("field failed" , field.id , e);
            errors.push(`${field.id}: ${e}`);
        }
    }
    return NextResponse.json({
        message: "Cron job completed successfully.",
        fields: fields.length,
        errors,
    });
}