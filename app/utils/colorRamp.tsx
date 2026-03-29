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
    [badThreshold - 0.15, 0x8b0000], // dark red  – severely stressed
    [badThreshold,        0xff0000], // red       – stressed
    [(badThreshold + goodThreshold) / 2, 0xffff00], // yellow – marginal
    [goodThreshold,       0x00cc00], // green     – healthy
    [goodThreshold + 0.1, 0x006600], // dark green – very healthy
];

const NDMI_UNIVERSAL_RAMP: number[][] = [
    [-0.8, 0x8b0000], // extremely dry / bare soil
    [-0.2, 0xff4500], // severe water stress
    [0.0,  0xff8c00], // moderate stress
    [0.2,  0xffff00], // mild stress
    [0.4,  0x90ee90], // adequate moisture
    [0.6,  0x228b22], // good moisture
    [0.8,  0x006400], // very high moisture (or flooded if rice)
];


const cropModifiers: Record<
    string,
    Record<ImageType, number[][]>
> = {
    wheat: {
        waterRequirement:  NDMI_UNIVERSAL_RAMP,

        nitrogenRequirement:  makeHealthRamp(0.25, 0.40),

        phosphorusRequirement: makeHealthRamp(0.1, 0.4),

        cropStress:  [
            [-1.0, 0xff0000], // bare / dead
            [0.2,  0xff4500], // seedling / very stressed
            [0.4,  0xff8c00], // moderate stress
            [0.6,  0xffff00], // below healthy range
            [0.72, 0x00cc00], // healthy (GS32+ threshold)
            [0.85, 0x006400], // peak canopy
        ],
    },

    rice: {
        waterRequirement:  [
            [-0.8, 0x8b0000], // severe dry stress — very abnormal for paddy
            [-0.1, 0xff4500], // water stress
            [0.2,  0xffff00], // below optimal for paddy
            [0.5,  0x90ee90], // adequate for rain-fed
            [0.65, 0x228b22], // good — paddy field normal range
            [0.8,  0x006400], // flooded paddy — expected for wet rice
        ],
        nitrogenRequirement: makeHealthRamp(0.30, 0.48),

        phosphorusRequirement: makeHealthRamp(0.15, 0.45),

        cropStress:  [
            [-1.0, 0xff0000],
            [0.3,  0xff4500], // early seedling stress
            [0.55, 0xff8c00], // below optimal
            [0.7,  0xffff00], // marginal
            [0.8,  0x00cc00], // healthy (reproductive stage threshold)
            [0.9,  0x006400], // peak canopy
        ],
    },

    cotton: {
        waterRequirement: [
            [-0.8, 0x8b0000],
            [-0.1, 0xff0000], // stress starts earlier for cotton during boll set
            [0.1,  0xff8c00],
            [0.3,  0xffff00],
            [0.5,  0x00cc00], // good moisture for boll filling
            [0.7,  0x006400],
        ],

        nitrogenRequirement:  makeHealthRamp(0.28, 0.45),

        phosphorusRequirement:  makeHealthRamp(0.12, 0.42),

        cropStress: [
            [-1.0, 0xff0000],
            [0.15, 0xff4500], // seedling / very stressed
            [0.35, 0xff8c00], // below healthy vegetative
            [0.55, 0xffff00], // approaching healthy
            [0.68, 0x00cc00], // healthy vegetative/flowering peak
            [0.80, 0x006400], // dense canopy
        ],
    },

    other: {
        waterRequirement:  NDMI_UNIVERSAL_RAMP,

        nitrogenRequirement: makeHealthRamp(0.25, 0.40),

        phosphorusRequirement:  makeHealthRamp(0.10, 0.40),
        
        cropStress:  [
            [-1.0, 0xff0000],
            [0.2,  0xff4500],
            [0.4,  0xff8c00],
            [0.55, 0xffff00],
            [0.7,  0x00cc00],
            [0.85, 0x006400],
        ],
    },
};

export function getColorRamp(
    crop: string,
    imageType: ImageType
):  number[][] {
    let res = cropModifiers[crop];
    if(!res) {
        res = cropModifiers["other"];
    }
    return res[imageType];
}