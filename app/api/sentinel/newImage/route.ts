// app/api/remap/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import sharp from "sharp";
//import { getMoistureSensitivity } from "@/app/utils/sensitivity";
import { availableCrops } from "@/data/crop";
import { ImageType } from "@/app/types";
import { newSensistivity } from "./utils/Color";

// --- Your color mappings ---
const originalColors: [number, number][] = [
  [0.1, 8388608], [0.12, 10027008], [0.14, 11665408], [0.16, 13369344],
  [0.18, 15007744], [0.2, 16711680], [0.22, 16724480], [0.24, 16737536],
  [0.26, 16750848], [0.28, 16763904], [0.3, 16776960], [0.32, 13369139],
  [0.34, 10026854], [0.36, 6750104], [0.38, 3407819], [0.4, 65535],
  [0.42, 52479], [0.44, 39423], [0.46, 26111], [0.48, 13311],
  [0.5, 255], [0.52, 229], [0.54, 204], [0.56, 178],
  [0.58, 153], [0.6, 128]
];

function decimalToRgb(decimal: number) {
  const r = (decimal >> 16) & 255;
  const g = (decimal >> 8) & 255;
  const b = decimal & 255;
  return [r, g, b];
}
function rgbToKey(r: number, g: number, b: number) {
  return `${r},${g},${b}`;
}

const colorToIndex: Record<string, number> = {};
originalColors.forEach(([index, decimalColor]) => {
  const [r, g, b] = decimalToRgb(decimalColor);
  const key = rgbToKey(r, g, b);
  colorToIndex[key] = index;
});

const newColorPalette: Record<number, [number, number, number]> = {
  0.1: [255, 0, 0], 0.12: [255, 64, 0], 0.14: [255, 128, 0], 0.16: [255, 192, 0],
  0.18: [255, 255, 0], 0.2: [192, 255, 0], 0.22: [128, 255, 0], 0.24: [64, 255, 0],
  0.26: [0, 255, 0], 0.28: [0, 255, 64], 0.3: [0, 255, 128], 0.32: [0, 255, 192],
  0.34: [0, 255, 255], 0.36: [0, 192, 255], 0.38: [0, 128, 255], 0.4: [0, 64, 255],
  0.42: [0, 0, 255], 0.44: [64, 0, 255], 0.46: [128, 0, 255], 0.48: [192, 0, 255],
  0.5: [255, 0, 255], 0.52: [255, 0, 192], 0.54: [255, 0, 128], 0.56: [255, 0, 64],
  0.58: [255, 64, 64], 0.6: [128, 128, 128]
};

function findClosestColorIndex(r: number, g: number, b: number) {
  const key = rgbToKey(r, g, b);

  if (colorToIndex.hasOwnProperty(key)) {
    return colorToIndex[key];
  }

  let minDistance = Infinity;
  let closestIndex = 0.1;

  for (const [colorKey, index] of Object.entries(colorToIndex)) {
    const [cr, cg, cb] = colorKey.split(",").map(Number);
    const distance = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index as unknown as number;
    }
  }
  return closestIndex;
}

async function remapImageColors(inputBuffer: Buffer , imageType : ImageType): Promise<Buffer> {
  const { data, info } = await sharp(inputBuffer).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const newData = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = channels === 4 ? data[i + 3] : 255;

    const colorIndex = findClosestColorIndex(r, g, b);
    const newIndex = imageType === "waterRequirement" ? (0.6 - colorIndex) : newSensistivity(1.01 , -0.02 , colorIndex);
    const newColor = newColorPalette[ newIndex ]?? [255, 255, 255];

    newData[i] = newColor[0];
    newData[i + 1] = newColor[1];
    newData[i + 2] = newColor[2];
    if (channels === 4) newData[i + 3] = a;
  }

  return await sharp(newData, { raw: { width, height, channels } }).png().toBuffer();
}

async function moistureSensitivity(date : Date, crop : keyof typeof availableCrops, variety : string) {
    const period = (Date.now() - date.getTime()) / (1000*60*60*24*30);
   // const sensitivity = getMoistureSensitivity(crop , variety , Math.round(period));


}

// --- API Route ---
export async function POST(req: Request) {
  try {
    const { bucket, cropId , plantedDate  , to } = await req.json();

    if (!bucket || !cropId || !plantedDate || !to) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    
    const ImageType = to as ImageType;
    const inputPath = `${cropId}/${plantedDate}/moistureLevel.png`;
    const outputPath = `${cropId}/${plantedDate}/${ImageType}.png`;

    // 1. Download from Supabase
    const { data: file, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(inputPath);

    if (downloadError) {
        return NextResponse.json({ error: downloadError.message }, { status: 500 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // 2. Remap
    const outputBuffer = await remapImageColors(inputBuffer , ImageType);

    // 3. Upload new file
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(outputPath, outputBuffer, {
            contentType: "image/png",
            upsert: true,
        });

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 4. Delete local temp files? -> none (we never save locally)

    // 5. (Optional) Get public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(outputPath);

    return NextResponse.json({
        message: "Image remapped and uploaded successfully",
        path: `${bucket}/${outputPath}`,
        publicUrl: publicUrlData.publicUrl,
    });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
