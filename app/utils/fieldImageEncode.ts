import sharp from "sharp";

export async function encodeFieldImage(input: Uint8Array | Buffer): Promise<Buffer> {
    const source = Buffer.from(input);
    const meta = await sharp(source).metadata();

    if (!meta.hasAlpha) {
        throw new Error("field image is missing an alpha channel");
    }

    if (meta.width !== 512 || meta.height !== 512) {
        throw new Error(`unexpected field image size ${meta.width}x${meta.height}`);
    }

    return sharp(source).webp({ lossless: true, effort: 6 }).toBuffer();
}
