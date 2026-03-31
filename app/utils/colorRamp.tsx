import { availableCrops } from "@/data/crop";


export type CropKey = keyof typeof availableCrops;
export type ImageType =
    | "waterRequirement"
    | "nitrogenRequirement"
    | "phosphorusRequirement"
    | "cropStress";


const makeHealthRamp = (
    badThreshold: number,
    goodThreshold: number
): number[][] => [
    [badThreshold - 0.15, 0x8b0000], 
    [badThreshold,        0xff0000],
    [(badThreshold + goodThreshold) / 2, 0xffff00], 
    [goodThreshold,       0x00cc00], 
    [goodThreshold + 0.1, 0x006600], 
];

const NDMI_UNIVERSAL_RAMP: number[][] = [
    [-0.8, 0x8b0000],
    [-0.2, 0xff4500],
    [0.0,  0xff8c00],
    [0.2,  0xffff00], 
    [0.4,  0x90ee90], 
    [0.6,  0x228b22], 
    [0.8,  0x006400], 
];


type WheatStage   = "seedling" | "elongation" | "heading" | "maturity";
type RiceStage    = "seedling" | "tillering"  | "reproductive" | "ripening";
type CottonStage  = "seedling" | "vegetative" | "flowering" | "bollMaturation";
type GenericStage = "seedling" | "vegetative" | "reproductive" | "maturity";

function daysAfter(plantingDate: Date): number {
    return Math.floor((Date.now() - plantingDate.getTime()) / 86_400_000);
}

function wheatStage(days: number): WheatStage {
    if (days < 45)  return "seedling";
    if (days < 75)  return "elongation";
    if (days < 100) return "heading";
    return "maturity";
}

function riceStage(days: number): RiceStage {
    if (days < 30)  return "seedling";
    if (days < 65)  return "tillering";
    if (days < 95)  return "reproductive";
    return "ripening";
}

function cottonStage(days: number): CottonStage {
    if (days < 30)  return "seedling";
    if (days < 70)  return "vegetative";
    if (days < 150) return "flowering";
    return "bollMaturation";
}

function genericStage(days: number): GenericStage {
    if (days < 30)  return "seedling";
    if (days < 70)  return "vegetative";
    if (days < 110) return "reproductive";
    return "maturity";
}


const wheatRamps: Record<WheatStage, Record<ImageType, number[][]>> = {
    seedling: {
        waterRequirement:      NDMI_UNIVERSAL_RAMP,
        nitrogenRequirement:   makeHealthRamp(0.10, 0.25),
        phosphorusRequirement: makeHealthRamp(0.05, 0.20),
        cropStress: [
            [-1.0, 0xff0000],
            [0.10, 0xff4500],
            [0.20, 0xff8c00],
            [0.30, 0xffff00],
            [0.40, 0x00cc00],
            [0.55, 0x006400],
        ],
    },
    elongation: {
        waterRequirement:      NDMI_UNIVERSAL_RAMP,
        nitrogenRequirement:   makeHealthRamp(0.20, 0.38),
        phosphorusRequirement: makeHealthRamp(0.10, 0.35),
        cropStress: [
            [-1.0, 0xff0000],
            [0.20, 0xff4500],
            [0.40, 0xff8c00],
            [0.55, 0xffff00],
            [0.65, 0x00cc00],
            [0.80, 0x006400],
        ],
    },
    heading: {
        waterRequirement:      NDMI_UNIVERSAL_RAMP,
        nitrogenRequirement:   makeHealthRamp(0.25, 0.42),
        phosphorusRequirement: makeHealthRamp(0.12, 0.40),
        cropStress: [
            [-1.0, 0xff0000],
            [0.30, 0xff4500],
            [0.50, 0xff8c00],
            [0.62, 0xffff00],
            [0.72, 0x00cc00], 
            [0.85, 0x006400],
        ],
    },
    maturity: {
        waterRequirement:      NDMI_UNIVERSAL_RAMP,
        nitrogenRequirement:   makeHealthRamp(0.15, 0.30),
        phosphorusRequirement: makeHealthRamp(0.08, 0.25),
        cropStress: [
            [-1.0, 0xff0000],
            [0.15, 0xff4500],
            [0.30, 0xff8c00],
            [0.42, 0xffff00],
            [0.55, 0x00cc00], 
            [0.70, 0x006400],
        ],
    },
};

const riceRamps: Record<RiceStage, Record<ImageType, number[][]>> = {
    seedling: {
        waterRequirement: [
            [-0.8, 0x8b0000],
            [-0.1, 0xff4500],
            [0.15, 0xffff00],
            [0.40, 0x90ee90],
            [0.60, 0x228b22],
            [0.80, 0x006400],
        ],
        nitrogenRequirement:   makeHealthRamp(0.12, 0.28),
        phosphorusRequirement: makeHealthRamp(0.08, 0.22),
        cropStress: [
            [-1.0, 0xff0000],
            [0.10, 0xff4500],
            [0.25, 0xff8c00],
            [0.35, 0xffff00],
            [0.45, 0x00cc00],
            [0.60, 0x006400],
        ],
    },
    tillering: {
        waterRequirement: [
            [-0.8, 0x8b0000],
            [-0.1, 0xff4500],
            [0.20, 0xffff00],
            [0.50, 0x90ee90],
            [0.65, 0x228b22],
            [0.80, 0x006400],
        ],
        nitrogenRequirement:   makeHealthRamp(0.22, 0.38),
        phosphorusRequirement: makeHealthRamp(0.12, 0.32),
        cropStress: [
            [-1.0, 0xff0000],
            [0.25, 0xff4500],
            [0.45, 0xff8c00],
            [0.58, 0xffff00],
            [0.70, 0x00cc00],
            [0.82, 0x006400],
        ],
    },
    reproductive: {
        waterRequirement: [
            [-0.8, 0x8b0000],
            [-0.1, 0xff4500],
            [0.20, 0xffff00],
            [0.50, 0x90ee90],
            [0.65, 0x228b22],
            [0.80, 0x006400],
        ],
        nitrogenRequirement:   makeHealthRamp(0.30, 0.48),
        phosphorusRequirement: makeHealthRamp(0.15, 0.45),
        cropStress: [
            [-1.0, 0xff0000],
            [0.30, 0xff4500],
            [0.55, 0xff8c00],
            [0.70, 0xffff00],
            [0.80, 0x00cc00],
            [0.90, 0x006400],
        ],
    },
    ripening: {
        waterRequirement: [
            [-0.8, 0x8b0000],
            [0.00, 0xff4500],
            [0.25, 0xffff00],
            [0.45, 0x90ee90],
            [0.60, 0x228b22],
            [0.75, 0x006400],
        ],
        nitrogenRequirement:   makeHealthRamp(0.15, 0.30),
        phosphorusRequirement: makeHealthRamp(0.10, 0.25),
        cropStress: [
            [-1.0, 0xff0000],
            [0.20, 0xff4500],
            [0.38, 0xff8c00],
            [0.50, 0xffff00],
            [0.62, 0x00cc00], 
            [0.75, 0x006400],
        ],
    },
};

const cottonRamps: Record<CottonStage, Record<ImageType, number[][]>> = {
    seedling: {
        waterRequirement: [
            [-0.8, 0x8b0000],
            [-0.1, 0xff0000],
            [0.05, 0xff8c00],
            [0.20, 0xffff00],
            [0.35, 0x00cc00],
            [0.55, 0x006400],
        ],
        nitrogenRequirement:   makeHealthRamp(0.08, 0.22),
        phosphorusRequirement: makeHealthRamp(0.05, 0.18),
        cropStress: [
            [-1.0, 0xff0000],
            [0.08, 0xff4500],
            [0.18, 0xff8c00],
            [0.28, 0xffff00],
            [0.38, 0x00cc00],
            [0.55, 0x006400],
        ],
    },
    vegetative: {
        waterRequirement: [
            [-0.8, 0x8b0000],
            [-0.1, 0xff0000],
            [0.10, 0xff8c00],
            [0.28, 0xffff00],
            [0.45, 0x00cc00],
            [0.65, 0x006400],
        ],
        nitrogenRequirement:   makeHealthRamp(0.20, 0.38),
        phosphorusRequirement: makeHealthRamp(0.10, 0.32),
        cropStress: [
            [-1.0, 0xff0000],
            [0.15, 0xff4500],
            [0.32, 0xff8c00],
            [0.48, 0xffff00],
            [0.60, 0x00cc00],
            [0.75, 0x006400],
        ],
    },
    flowering: {
        waterRequirement: [
            [-0.8, 0x8b0000],
            [-0.1, 0xff0000], 
            [0.10, 0xff8c00],
            [0.30, 0xffff00],
            [0.50, 0x00cc00],
            [0.70, 0x006400],
        ],
        nitrogenRequirement:   makeHealthRamp(0.28, 0.45),
        phosphorusRequirement: makeHealthRamp(0.12, 0.42),
        cropStress: [
            [-1.0, 0xff0000],
            [0.20, 0xff4500],
            [0.40, 0xff8c00],
            [0.55, 0xffff00],
            [0.68, 0x00cc00], 
            [0.80, 0x006400],
        ],
    },
    bollMaturation: {
        waterRequirement: [
            [-0.8, 0x8b0000],
            [-0.1, 0xff0000],
            [0.10, 0xff8c00],
            [0.28, 0xffff00],
            [0.45, 0x00cc00],
            [0.65, 0x006400],
        ],
        nitrogenRequirement:   makeHealthRamp(0.15, 0.30),
        phosphorusRequirement: makeHealthRamp(0.08, 0.25),
        cropStress: [
            [-1.0, 0xff0000],
            [0.10, 0xff4500],
            [0.25, 0xff8c00],
            [0.38, 0xffff00],
            [0.50, 0x00cc00], 
            [0.65, 0x006400],
        ],
    },
};

const otherRamps: Record<GenericStage, Record<ImageType, number[][]>> = {
    seedling: {
        waterRequirement:      NDMI_UNIVERSAL_RAMP,
        nitrogenRequirement:   makeHealthRamp(0.10, 0.25),
        phosphorusRequirement: makeHealthRamp(0.05, 0.20),
        cropStress: [
            [-1.0, 0xff0000],
            [0.10, 0xff4500],
            [0.22, 0xff8c00],
            [0.32, 0xffff00],
            [0.42, 0x00cc00],
            [0.58, 0x006400],
        ],
    },
    vegetative: {
        waterRequirement:      NDMI_UNIVERSAL_RAMP,
        nitrogenRequirement:   makeHealthRamp(0.22, 0.38),
        phosphorusRequirement: makeHealthRamp(0.10, 0.35),
        cropStress: [
            [-1.0, 0xff0000],
            [0.20, 0xff4500],
            [0.38, 0xff8c00],
            [0.52, 0xffff00],
            [0.65, 0x00cc00],
            [0.80, 0x006400],
        ],
    },
    reproductive: {
        waterRequirement:      NDMI_UNIVERSAL_RAMP,
        nitrogenRequirement:   makeHealthRamp(0.25, 0.42),
        phosphorusRequirement: makeHealthRamp(0.12, 0.40),
        cropStress: [
            [-1.0, 0xff0000],
            [0.25, 0xff4500],
            [0.42, 0xff8c00],
            [0.55, 0xffff00],
            [0.68, 0x00cc00],
            [0.82, 0x006400],
        ],
    },
    maturity: {
        waterRequirement:      NDMI_UNIVERSAL_RAMP,
        nitrogenRequirement:   makeHealthRamp(0.15, 0.30),
        phosphorusRequirement: makeHealthRamp(0.08, 0.25),
        cropStress: [
            [-1.0, 0xff0000],
            [0.15, 0xff4500],
            [0.30, 0xff8c00],
            [0.42, 0xffff00],
            [0.55, 0x00cc00],
            [0.70, 0x006400],
        ],
    },
};


export function getColorRamp(crop: string, imageType: ImageType, plantingDate: Date): number[][] {
    const days = daysAfter(plantingDate);

    if (crop === "wheat")  return wheatRamps[wheatStage(days)][imageType];
    if (crop === "rice")   return riceRamps[riceStage(days)][imageType];
    if (crop === "cotton") return cottonRamps[cottonStage(days)][imageType];

    return otherRamps[genericStage(days)][imageType];
}