import { availableCrops } from "@/data/crop";

function newSensistivity(m:number , c:number , index:number) {
    return (m*index) + c;
}

function newFormula(planted_at: Date , crop : keyof typeof availableCrops , variety : string) : {m : number , c : number} {
    const period = (Date.now() - planted_at.getTime()) / (1000*60*60*24*30);
    
    return {m : 0.9 , c : -0.1};
    
}


export {newSensistivity}