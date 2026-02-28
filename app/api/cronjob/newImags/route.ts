import { NextResponse , NextRequest } from "next/server";
import { db } from "@/app/lib/drizzle";
import { field as fieldDB , crop, avgPixelValue} from "@/db/schema";
import { supabase } from "@/app/lib/supabase";
import { sentinel_image , sentinel_catalog } from "@/app/utils/sentinel";
import { fromPostgresPolygon } from "@/app/utils/coordinate";
import { eq, sql } from "drizzle-orm";
import { ImageType } from "@/app/types";
import { getAverageRampValueFromUrl_Server } from "@/app/actions/actions";
import { getColorPalette as colorRamp } from "@/app/utils/Script";

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
                }
            }
        }
    });

    try{
        const pixelValues : {fieldId : string , imageType : ImageType , imageDate : string , value : number|null}[] = []
        for(const field of fields) {
            console.log("start" , field.id);
            const coor = fromPostgresPolygon(field.coordinates);
            // change coordinates to lat/lng to lng/lat
            const res = await sentinel_catalog({coordinates : coor.map((c : number[]) => [c[1], c[0]])})
            if(res.err) {
                console.log(res.err);
                return NextResponse.json(
                    { message : res.err },
                    { status : 500 }
                )
            }
    
            const dates = res.data.features.map((f : any) => f.properties.datetime);
            dates.sort((a:string, b:string) => new Date(b).getTime() - new Date(a).getTime());
    
            console.log(dates[0] , "\n" , field.imagesDates);
            if(field.imagesDates.includes(dates[0])) {
                console.log("already done" , field.id);
                continue;
            }
            
    
            for(const to  of ["waterRequirement" , "nitrogenRequirement" , "phosphorusRequirement" , "cropStress"] as ImageType[]) {
            
                await sentinel_image({coordinates : coor.map((c : number[]) => [c[1], c[0]]) , date:dates[0]  , imageType : to , crop : field.crop[0].name}).then(async (res) => {
                    if(res.err || res.data === null) {
                        console.log(res.err);
                        return null;
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
                        return null;
                    }
                    const rampRGB =  colorRamp(to).map(([value, intColor]) => {
                        const r = (intColor >> 16) & 255;
                        const g = (intColor >> 8) & 255;
                        const b = intColor & 255;
                        return { value, r, g, b };
                    });
                    const value = await getAverageRampValueFromUrl_Server(field.id , dates[0] , to , rampRGB)
                    pixelValues.push({fieldId : field.id , imageType : to , imageDate : dates[0] , value : value})
                })
                console.log("done" , to);
            }

            await db.update(fieldDB)
                .set({
                    imagesDates: sql`array_append(${fieldDB.imagesDates}, ${dates[0]})`
                })
                .where(eq(fieldDB.id, field.id))
            
            console.log("done" , field.id);
        }
        if (pixelValues.length != 0) await db.insert(avgPixelValue).values(pixelValues)
    }catch(e){
        console.log(e);
        return NextResponse.json(
            { message : "backend error : contact admin." },
            { status : 500 }
        )
    }
    return NextResponse.json({
        message: "Cron job completed successfully."
    });
}