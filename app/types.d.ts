
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


export type WheatStage   = "seedling" | "elongation" | "heading" | "maturity";
export type RiceStage    = "seedling" | "tillering"  | "reproductive" | "ripening";
export type CottonStage  = "seedling" | "vegetative" | "flowering" | "bollMaturation";
export type GenericStage = "seedling" | "vegetative" | "reproductive" | "maturity";


export type ImageType = "waterRequirement" | "nitrogenRequirement" | "phosphorusRequirement" | "cropStress";