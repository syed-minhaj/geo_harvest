"use server";

import { avgPixelValue } from "@/db/schema";
import { db } from "../lib/drizzle";
import { and, eq } from "drizzle-orm";
import { ImageType } from "../types";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
import sharp from "sharp";
import fetch from "node-fetch";

type rampRGB = {
    value : number,
    r : number,
    g : number,
    b : number,
}[]

export async function getAvgPixelValues(fieldId : string , imageType : ImageType ) {
    
    const avgPixelValues = await db
        .select({ImageDate : avgPixelValue.imageDate , value : avgPixelValue.value})
        .from(avgPixelValue)
        .where(and(
            eq(avgPixelValue.fieldId , fieldId),
            eq(avgPixelValue.imageType , imageType)
        ))

    return { avgPixelValues , err : null};
}


export async function setAvgPixelValueBatch(values : {fieldId : string , imageType : ImageType , imageDate : string , value : number | null}[]) {
    const session = await auth.api.getSession({headers : await headers()});
    if (!session) {
        return {err : "Please login to create a field."}
    }
    try {
        await db.insert(avgPixelValue).values(values)
        return {err : null}
    } catch (e :any) {
        console.log(e)
        return {err : "Backend error "}
    }

}


function findClosestValue(r: number, g: number, b: number ,  rampRGB : rampRGB) {
    let closestValue: number | null = null;
    let minDist = Infinity;
    for (let i = 0; i < rampRGB.length; i++) {
        const c = rampRGB[i];
        const dr = r - c.r;
        const dg = g - c.g;
        const db = b - c.b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) {
            minDist = dist;
            closestValue = c.value;
        }
    }
    return closestValue;
}

export async function getAverageRampValueFromUrl_Server(
        fieldId: string,
        imageDate: string,
        imageType: ImageType,
        rampRGB: { value: number; r: number; g: number; b: number }[]
    ): Promise<number | null> {
    
    const imageUrl = `https://gjrjmfbkexmuhyaajypa.supabase.co/storage/v1/object/public/field/${fieldId}/${imageDate}/${imageType}.png`;
    
    // Fetch image as buffer
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
    const buffer = await response.arrayBuffer();

    // Decode image to raw pixel data
    const { data, info } = await sharp(Buffer.from(buffer))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const pixelArray = new Uint8Array(data);
    let sum = 0, count = 0;

    for (let i = 0; i < pixelArray.length; i += 4) {
        const r = pixelArray[i];
        const g = pixelArray[i + 1];
        const b = pixelArray[i + 2];
        const a = pixelArray[i + 3];
        if (a === 0) continue;

        const val = findClosestValue(r, g, b, rampRGB);
        if (val !== null && val !== undefined) {
        sum += val;
        count++;
        }
    }

    if (count === 0) return null;
    return imageType === "cropStress" ? (sum / count) : (sum / count) / 0.6;
}
