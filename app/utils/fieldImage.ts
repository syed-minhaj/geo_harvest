import type { ImageType } from "../types";

export const FIELD_IMAGE_EXT = "webp";
export const FIELD_IMAGE_CONTENT_TYPE = "image/webp";
export const FIELD_IMAGE_CACHE_CONTROL = "31536000";

export const FIELD_IMAGE_TYPES: ImageType[] = [
    "waterRequirement",
    "nitrogenRequirement",
    "phosphorusRequirement",
    "cropStress",
];

const FALLBACK_SUPABASE_URL = "https://gjrjmfbkexmuhyaajypa.supabase.co";

export const FIELD_IMAGE_BASE_URL = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    FALLBACK_SUPABASE_URL
).replace(/\/$/, "");

export function fieldImagePath(fieldId: string, imageDate: string, imageType: string) {
    return `${fieldId}/${imageDate}/${imageType}.${FIELD_IMAGE_EXT}`;
}

export function fieldImageUrl(fieldId: string, imageDate: string, imageType: string) {
    return `${FIELD_IMAGE_BASE_URL}/storage/v1/object/public/field/${fieldImagePath(fieldId, imageDate, imageType)}`;
}
