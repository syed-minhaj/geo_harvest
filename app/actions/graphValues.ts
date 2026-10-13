"use server";
import { tfield , ImageType } from "@/app/types";
import { getDateShort } from "../utils/Date";
import { getAverageRampValueFromUrl_Server, revalidatePath_fromClient, setAvgPixelValueBatch } from "./actions";
import { revalidatePath } from "next/cache";
import { getColorRamp, RAMP_MAX } from "../utils/colorRamp";
import { getAgriCycle, getCycleByIndex, getCycleIndex } from "../utils/agriCycle";

type rampRGB = {
    value : number,
    r : number,
    g : number,
    b : number,
}[]

type avgPixelValue = {
    fieldId : string,
    imageType : ImageType,
    imageDate : string,
    value : number | null,
}

function interpolateColorFromHex(target:number , colorRamp : number[][] , imageType : ImageType) {
    target = target * RAMP_MAX[imageType]
    const stops = [...colorRamp].sort((a, b) => a[0] - b[0]);
    if (stops.length === 0) return 0;
    if (target <= stops[0][0]) return stops[0][1];
    if (target >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
    for (let i = 0; i < stops.length - 1; i++) {
        const [v0, c0] = stops[i];
        const [v1, c1] = stops[i + 1];
        if (target >= v0 && target <= v1) {
            const t = v1 === v0 ? 0 : (target - v0) / (v1 - v0);
            const r = Math.round(((c0 >> 16) & 255) * (1 - t) + ((c1 >> 16) & 255) * t);
            const g = Math.round(((c0 >> 8) & 255) * (1 - t) + ((c1 >> 8) & 255) * t);
            const b = Math.round((c0 & 255) * (1 - t) + (c1 & 255) * t);
            return (r << 16) | (g << 8) | b;
        }
    }
    return stops[stops.length - 1][1];
}


function average(numbers : number[]) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }
    return sum / numbers.length;
}

async function getAverageRampValueFromUrl(fieldId : string , imageDate : string , ImageType : ImageType , rampRGB : rampRGB , cache : avgPixelValue[]): Promise<number | null> {
    const a  = cache.find((p) => p.fieldId == fieldId && p.imageType == ImageType && p.imageDate == imageDate)
    if (a) return a.value
    try{
        const res = await getAverageRampValueFromUrl_Server(fieldId , imageDate , ImageType , rampRGB)
        cache.push({fieldId , imageType : ImageType , imageDate , value : res})
        return res;
    }catch(e){
        console.log(e)
        cache.push({fieldId , imageType : ImageType , imageDate , value : null})
        return null;
    }
}

async function getGraphData(field : tfield & {crop : {name : string , planted_at : Date}[]}  , avgPixelValue : avgPixelValue[]  , graphType : "yearly" | "crop cycle" , ImageType : ImageType) {
    // Request-local: values fetched on demand for this call, flushed (yearly) at
    // the end. Kept off module scope so concurrent requests/users can't mix or
    // clobber each other's pending rows.
    const pendingValues : avgPixelValue[] = []
    const cropColorRamp = (date : string) => getColorRamp(field.crop[0].name , ImageType , field.crop[0].planted_at , new Date(date));
    const cropRampRGB = (date : string) : rampRGB => cropColorRamp(date).map(([value, intColor]) => {
        const r = (intColor >> 16) & 255;
        const g = (intColor >> 8) & 255;
        const b = intColor & 255;
        return { value, r, g, b };
    });
    const avgPixelValues  = avgPixelValue.filter(({imageType}) => imageType == ImageType)
    
    const graphData : {date : string , value : number}[] = []
    const dateToValue : {[key : string] : number} = {}
    for (const avgPixelValue of avgPixelValues) {
        dateToValue[avgPixelValue.imageDate] = avgPixelValue.value ?? NaN
    }

    let lasthex = "#4E9E6B";
    const noOfValues = Object.keys(field.imagesDates).length;

    if (graphType == "yearly"){
        for(let i = noOfValues-1 ; i >= 0 ; i--) {
            const date = field.imagesDates[i];
            const rampRGB = cropRampRGB(date);
            const a = dateToValue[date] ?? await getAverageRampValueFromUrl(field.id , date , ImageType , rampRGB , pendingValues)
            if(a !== null && !Number.isNaN(a)) {
                lasthex ="#" + interpolateColorFromHex(a , cropColorRamp(date) , ImageType).toString(16).padStart(6, '0').toUpperCase();
                graphData.push({
                    date :  getDateShort(new Date(date)),
                    value : a < 0 ? 0 : a,
                })
            }else{
                graphData.push({
                    date :  getDateShort(new Date(date)),
                    value : NaN,
                })
            }
        }
    }
    
    else{
        const cycleValues : number[][] = [[], [], [], []]
        const cycleDates : string[][] = [[], [], [], []]
        for(let i = noOfValues-1 ; i >= 0 ; i--) {
            const date = field.imagesDates[i];
            const cycleIndex = getCycleIndex(getAgriCycle(new Date(date) , field.crop[0].name , field.crop[0].planted_at) , field.crop[0].name);
            if (cycleIndex < 0 || cycleIndex > 3) continue;
            const rampRGB = cropRampRGB(date);
            const a = dateToValue[date] ?? await getAverageRampValueFromUrl(field.id , date , ImageType , rampRGB , pendingValues)
            if(a !== null && !Number.isNaN(a)) {
                cycleValues[cycleIndex].push(a < 0 ? 0 : a)
                cycleDates[cycleIndex].push(date)
            }
        }
        for(let i = 0 ; i < 4 ; i++) {
            if (cycleValues[i].length != 0){
                const repDate = cycleDates[i][0];
                lasthex ="#" + interpolateColorFromHex(average(cycleValues[i]) , cropColorRamp(repDate) , ImageType).toString(16).padStart(6, '0').toUpperCase();
            }
            graphData.push({
                date : getCycleByIndex(i, field.crop[0].name),
                value : cycleValues[i].length != 0 ? average(cycleValues[i]) : NaN,
            })
        }
    }

    if (graphType == "yearly" && pendingValues.length != 0) {
        await setAvgPixelValueBatch(pendingValues);
        revalidatePath(`/app/fields/${field.id}`);
    }
    return {graphData , lasthex}
}

export {getGraphData}