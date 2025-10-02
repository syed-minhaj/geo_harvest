
export type tfield = {
    id : string,
    name : string,
    coordinates : string,
    ownerId : string,
    created_at : Date,
    updated_at : Date,
    imagesDates : string[],
}

export type tcrop = {
    id: string;
    name: "other" | "wheat" | "rice" | "cotton";
    created_at: Date;
    updated_at: Date;
    seedVariety: string;
    fieldId: string;
    planted_at: Date | null;
}

export type ImageType = "waterRequirement" | "nitrogenRequirement" | "phosphorusRequirement" | "cropStress";