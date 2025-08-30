
export type tfield = {
    id : string,
    name : string,
    coordinates : string,
    ownerId : string,
    created_at : Date,
    updated_at : Date,
    imagesDates : string[],
}

export type ImageType = "waterRequirement" | "cropHealth" | "moistuerLevel";