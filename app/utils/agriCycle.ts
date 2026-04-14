
import { WheatStage , RiceStage , CottonStage , GenericStage } from "@/app/types";


export function daysAfter(plantingDate: Date): number {
    return Math.floor((Date.now() - plantingDate.getTime()) / 86_400_000);
}

const wStage = ["seedling", "elongation", "heading", "maturity"] as WheatStage[];
const rStage = ["seedling", "tillering", "reproductive", "ripening"] as RiceStage[];
const cStage = ["seedling", "vegetative", "flowering", "bollMaturation"] as CottonStage[];
const gStage = ["seedling", "vegetative", "reproductive", "maturity"] as GenericStage[];

export function wheatStage(days: number): WheatStage {
    if (days < 45)  return wStage[0];
    if (days < 75)  return wStage[1];
    if (days < 100) return wStage[2];
    return wStage[3];
}

export function riceStage(days: number): RiceStage {
    if (days < 30)  return rStage[0];
    if (days < 65)  return rStage[1];
    if (days < 95)  return rStage[2];
    return rStage[3];
}

export function cottonStage(days: number): CottonStage {
    if (days < 30)  return cStage[0];
    if (days < 70)  return cStage[1];
    if (days < 150) return cStage[2];
    return cStage[3];
}

export function genericStage(days: number): GenericStage {
    if (days < 30)  return gStage[0];
    if (days < 70)  return gStage[1];
    if (days < 110) return gStage[2];
    return gStage[3];
}

export function getAgriCycle(CurrentDate : Date , cropType : string , planted_at : Date ) {

    const stageMap: Record<string, (d: number) => string> = {
        wheat: wheatStage,
        rice: riceStage,
        cotton: cottonStage,
    };

    const days = Math.floor((CurrentDate.getTime() - planted_at.getTime()) / 86_400_000);

    const determineStage = stageMap[cropType] || genericStage;

    return determineStage(days);

}

export function getCycleByIndex(index : number , cropType : string) {
    const stageMap: Record<string, string[]> = {
        wheat: wStage,
        rice: rStage,
        cotton: cStage,
    };

    const determineStage = stageMap[cropType] || genericStage;

    return determineStage[index];

}