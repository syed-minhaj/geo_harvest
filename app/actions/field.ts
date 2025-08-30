"use server";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/drizzle";
import { Crop as CropName , field , crop } from "@/db/schema";
import { supabase } from "@/app/lib/supabase";
import { sentinel_catalog, sentinel_image } from "./sentinel";
import { eq, sql } from "drizzle-orm";


type CropType = {
    name : CropName,
    variety : string,
    plantedDate : Date
}

export async function CreateField({name , coordinates , fcrop} : {name : string, coordinates : number[][] , fcrop : CropType}) {

    const session = await auth.api.getSession({headers : await headers()});
    if (!session) {
            return {err : "Please login to create a field."}
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

        await sentinel_catalog({coordinates}).then(async (res) => {
            if(res.err) {
                console.log(res.err);
                return ;
            }

            const dates = res.data.features.map((f : any) => f.properties.datetime);
            dates.sort((a:string, b:string) => new Date(b).getTime() - new Date(a).getTime());

            await db.update(field)
                .set({
                    imagesDates: sql`array_append(${field.imagesDates}, ${dates[0]})`
                })
                .where(eq(field.id, feildId))

            await sentinel_image({coordinates , date:dates[0] }).then(async (res) => {
                if(res.err || res.data === null) {
                    console.log(res.err);
                    return null;
                }
                
                const { data, error } = await supabase.storage
                    .from("field")
                    .upload(`${feildId}/${dates[0]}/moistureLevel.png`, res.data, {
                        cacheControl: '3600', 
                        contentType: 'image/png', 
                        upsert: false, 
                    });

                
                if (error) {
                    console.error('Error uploading image:', error.message);
                    return null;
                } else {
                    console.log('Image uploaded successfully:', data);
                    for(const to of ["waterRequirement" , "cropHealth"]) {

                        await fetch("http://localhost:3000/api/sentinel/newImage", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                bucket : "field",
                                cropId : feildId,
                                plantedDate : dates[0],
                                to ,
                            })
                        }).then(async (res) => {
                            if(res.status !== 200) {
                                console.log(res);
                                return;
                            }
                        })
                    }
                }
            })
        })
        return {err : null}
    } catch (e :any) {
        console.log(e)
        return {err : "Backend error "}
    }
    
   
}


function toPostgresPolygon(coords: number[][]): string {
    return `((${coords.map(([x, y]) => `${x},${y}`).join("),(")}))`;
}
