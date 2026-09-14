"use server";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/drizzle";
import { Crop as CropName , field , crop, avgPixelValue } from "@/db/schema";
import { supabase } from "@/app/lib/supabase";
import { sentinel_catalog, sentinel_image } from "../utils/sentinel";
import { and, count, eq, sql } from "drizzle-orm";
import { ImageType } from "../types";
import { getAverageRampValueFromUrl_Server } from "@/app/actions/actions";
import { getColorRamp } from "../utils/colorRamp";

type CropType = {
    name : CropName,
    variety : string,
    plantedDate : Date
}

async function userAllowedToCreateField(userID : string) {
    if (userID === process.env.ADMIN_USER_ID) return true;
    const fieldCount = await db.select({count : count()}).from(field).where(eq(field.ownerId , userID)).execute();
    if (fieldCount[0].count > 2) return false ;
    return true;
}

export async function CreateField({name , coordinates , fcrop} : {name : string, coordinates : number[][] , fcrop : CropType}) {

    const session = await auth.api.getSession({headers : await headers()});
    if (!session) {
            return {err : "Please login to create a field."}
    }

    if (!await userAllowedToCreateField(session.user.id)) {
        return {err : "You have reached the maximum number of fields."}
    }
    try {
        const f = await db.insert(field).values({
            name : name,
            coordinates : toPostgresPolygon(coordinates),
            ownerId : session.user.id,
        }).returning({insertedId : field.id})
        const feildId = f[0].insertedId

        await db.insert(crop).values({
            fieldId : feildId,
            name : fcrop.name,
            seedVariety : fcrop.variety,
            planted_at : fcrop.plantedDate,
        })

        const res = await sentinel_catalog({coordinates})
        if(res.err) {
            console.error(res.err);
            return {err : res.err , data : null}
        }

        const dates = res.data.features.map((f : any) => f.properties.datetime);
        dates.sort((a:string, b:string) => new Date(b).getTime() - new Date(a).getTime());

        if (dates.length === 0) return {err : null , data : {id: feildId}}

        const pixelValues : {fieldId : string , imageType : ImageType , imageDate : string , value : number|null}[] = []
        const uploadedPaths : string[] = []
        let failed : string | null = null
        for(const to  of ["waterRequirement" , "nitrogenRequirement" , "phosphorusRequirement" , "cropStress"] as ImageType[]) {

            const res = await sentinel_image({coordinates , date:dates[0]  , imageType : to , crop : fcrop.name , plantingDate : fcrop.plantedDate})
            if(res.err || res.data === null) {
                console.error(res.err);
                failed = `image generation failed for ${to}: ${res.err ?? "no data"}`;
                break;
            }
            const { data, error } = await supabase.storage
                .from("field")
                .upload(`${feildId}/${dates[0]}/${to}.png`, res.data, {
                    cacheControl: '3600', 
                    contentType: 'image/png', 
                    upsert: true, 
                });
            if (error) {
                console.error('Error uploading image:', error.message);
                failed = `upload failed for ${to}: ${error.message}`;
                break;
            }
            uploadedPaths.push(`${feildId}/${dates[0]}/${to}.png`)

            const rampRGB =  getColorRamp(fcrop.name , to , fcrop.plantedDate , new Date(dates[0])).map(([value, intColor]) => {
                const r = (intColor >> 16) & 255;
                const g = (intColor >> 8) & 255;
                const b = intColor & 255;
                return { value, r, g, b };
            });
            let value : number | null = null
            try {
                value = await getAverageRampValueFromUrl_Server(feildId , dates[0] , to , rampRGB)
            } catch (e : any) {
                console.error(e);
                failed = `value computation failed for ${to}: ${e?.message ?? e}`;
                break;
            }
            pixelValues.push({fieldId : feildId , imageType : to , imageDate : dates[0] , value : value})
        }

        if (failed) {
            // All-or-none: clean up partial images and never record the date.
            if (uploadedPaths.length > 0) {
                await supabase.storage.from("field").remove(uploadedPaths);
            }
            console.error(failed);
            return {err : "backend error : contact admin." , data : null};
        }

        // Only record the date once every image type exists.
        await db.update(field)
            .set({
                imagesDates: sql`array_append(${field.imagesDates}, ${dates[0]})`
            })
            .where(eq(field.id, feildId))
        if (pixelValues.length != 0) await db.insert(avgPixelValue).values(pixelValues)
        
        return {err : null , data : {id : feildId}}
    } catch (e :any) {
        console.error(e)
        return {err : "Backend error "}
    }
    
   
}

export async function DeleteField({id} : {id : string }) {
    const session = await auth.api.getSession({headers : await headers()});
    if (!session) {
        return {err : "Please login to delete a field."}
    }

    const selectedField = await db.query.field.findFirst({
        where: (field , {eq}) => (eq(field.id , id)),
        columns : {
            ownerId : true,
            imagesDates : true,
        }
    })
    if(!selectedField) {
        return {err : "Field not found"}
    }

    if(selectedField.ownerId !== session.user.id) {
        return {err : "Unauthorized"}
    }

    try {
        await db.delete(field).where(eq(field.id , id))
        await db.delete(crop).where(eq(crop.fieldId , id))
        await db.delete(avgPixelValue).where(eq(avgPixelValue.fieldId , id))
        const paths = selectedField.imagesDates.map((date : string) => {
            const p = ["waterRequirement" , "nitrogenRequirement" , "phosphorusRequirement" , "cropStress"].map((type : string) => {
                return `${id}/${date}/${type}.png`
            })
            return p;
        })
        for(const path of paths) {
            await supabase.storage.from("field").remove(path)
        }
    } catch (e :any) {
        console.log(e)
        return {err : "Backend error "}
    }
}


function toPostgresPolygon(coords: number[][]): string {
    return `((${coords.map(([x, y]) => `${x},${y}`).join("),(")}))`;
}


export async function getAvgPixelValueByFieldIdImageType(fieldId : string , imageType : ImageType) {
    const avgPixelValues = await db
        .select({
            fieldId : avgPixelValue.fieldId ,
            imageType : avgPixelValue.imageType ,
            imageDate : avgPixelValue.imageDate , 
            value : avgPixelValue.value
        })
        .from(avgPixelValue)
        .where(and(eq(avgPixelValue.fieldId , fieldId), eq(avgPixelValue.imageType , imageType)))

    return avgPixelValues;
}