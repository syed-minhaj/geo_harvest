"use server";

import { avgPixelValue } from "@/db/schema";
import { db } from "../lib/drizzle";
import { and, eq, sql } from "drizzle-orm";
import { ImageType } from "../types";
import { RAMP_MAX } from "../utils/colorRamp";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
import sharp from "sharp";
import fetch from "node-fetch";
import { revalidatePath } from "next/cache";

type rampRGB = {
    value : number,
    r : number,
    g : number,
    b : number,
}[]

export async function revalidatePath_fromClient(path : string) {
    await revalidatePath(path);
}

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
    // Collapse duplicate keys: a single ON CONFLICT statement cannot update the
    // same row twice.
    const unique = [...new Map(values.map((v) => [`${v.fieldId}|${v.imageType}|${v.imageDate}`, v])).values()];
    if (unique.length === 0) return {err : null};
    try {
        await db.insert(avgPixelValue).values(unique).onConflictDoUpdate({
            target: [avgPixelValue.fieldId, avgPixelValue.imageType, avgPixelValue.imageDate],
            set: { value: sql`excluded.value`, updated_at: new Date() },
        })
        return {err : null}
    } catch (e :any) {
        console.log(e)
        return {err : "Backend error "}
    }

}


function estimateRampValueFromColor(r: number, g: number, b: number, rampRGB: rampRGB) {
    if (rampRGB.length === 0) return null;
    if (rampRGB.length === 1) return rampRGB[0].value;

    // The map renders each pixel by interpolating between the two nearest ramp
    // stops, so a pixel colour lies somewhere along the piecewise-linear path
    // through the stops. Invert that mapping by projecting the pixel colour
    // onto every segment and taking the closest projection; return the value
    // at that projection. This preserves sub-stop precision instead of snapping
    // to the nearest stop (which quantised the average badly in sparse regions).
    let bestDist = Infinity;
    let bestValue = rampRGB[0].value;
    for (let i = 0; i < rampRGB.length - 1; i++) {
        const a = rampRGB[i];
        const c = rampRGB[i + 1];
        const dx = c.r - a.r;
        const dy = c.g - a.g;
        const dz = c.b - a.b;
        const len2 = dx * dx + dy * dy + dz * dz;
        let t = len2 === 0 ? 0 : ((r - a.r) * dx + (g - a.g) * dy + (b - a.b) * dz) / len2;
        if (t < 0) t = 0;
        else if (t > 1) t = 1;
        const qr = a.r + t * dx;
        const qg = a.g + t * dy;
        const qb = a.b + t * dz;
        const dr = r - qr;
        const dg = g - qg;
        const db = b - qb;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
            bestDist = dist;
            bestValue = a.value + t * (c.value - a.value);
        }
    }
    return bestValue;
}

export async function getAverageRampValueFromBuffer(
        buffer: Buffer | Uint8Array,
        imageType: ImageType,
        rampRGB: rampRGB
    ): Promise<number | null> {

    // Decode image to raw pixel data
    const { data } = await sharp(Buffer.from(buffer))
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

        const val = estimateRampValueFromColor(r, g, b, rampRGB);
        if (val !== null && val !== undefined) {
        sum += val;
        count++;
        }
    }

    if (count === 0) return null;
    return sum / count / RAMP_MAX[imageType];
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

    return getAverageRampValueFromBuffer(Buffer.from(buffer), imageType, rampRGB);
}
