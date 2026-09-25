"use server";
import { tfield , ImageType } from "@/app/types";
import { getDateShort } from "../utils/Date";
import { getAverageRampValueFromUrl_Server, revalidatePath_fromClient, setAvgPixelValueBatch } from "./actions";
import { revalidatePath } from "next/cache";
import { getColorRamp } from "../utils/colorRamp";
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

let pixelValues : {fieldId : string , imageType : ImageType , imageDate : string , value : number|null}[] = []

function findClosestColorFromHex(target:number , colorRamp : number[][] , imageType : ImageType) {
    if (imageType != "cropStress") target = target * 0.6
    let closestValue = NaN;
    let smallestDist = Infinity;
    for (const [value, intColor] of colorRamp) {
        const dist = Math.abs(target - value);
        if (dist < smallestDist) {
            smallestDist = dist;
            closestValue = intColor;
        }
    }
    return closestValue;
}


function average(numbers : number[]) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }
    return sum / numbers.length;
}

async function getAverageRampValueFromUrl(fieldId : string , imageDate : string , ImageType : ImageType , rampRGB : rampRGB): Promise<number | null> {
    const a  = pixelValues.find((p) => p.fieldId == fieldId && p.imageType == ImageType && p.imageDate == imageDate)
    if (a) return a.value
    try{
        const res = await getAverageRampValueFromUrl_Server(fieldId , imageDate , ImageType , rampRGB)
        pixelValues.push({fieldId , imageType : ImageType , imageDate , value : res})
        return res;
    }catch(e){
        console.log(e)
        pixelValues.push({fieldId , imageType : ImageType , imageDate , value : null})
        return null;
    }
}

async function getGraphData(field : tfield & {crop : {name : string , planted_at : Date}[]}  , avgPixelValue : avgPixelValue[]  , graphType : "yearly" | "crop cycle" , ImageType : ImageType) {
    
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
            const a = dateToValue[date] ?? await getAverageRampValueFromUrl(field.id , date , ImageType , rampRGB)
            if(a !== null && !Number.isNaN(a)) {
                lasthex ="#" + findClosestColorFromHex(a , cropColorRamp(date) , ImageType).toString(16).padStart(6, '0').toUpperCase();
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
            const a = dateToValue[date] ?? await getAverageRampValueFromUrl(field.id , date , ImageType , rampRGB)
            if(a !== null && !Number.isNaN(a)) {
                cycleValues[cycleIndex].push(a < 0 ? 0 : a)
                cycleDates[cycleIndex].push(date)
            }
        }
        for(let i = 0 ; i < 4 ; i++) {
            if (cycleValues[i].length != 0){
                const repDate = cycleDates[i][0];
                lasthex ="#" + findClosestColorFromHex(average(cycleValues[i]) , cropColorRamp(repDate) , ImageType).toString(16).padStart(6, '0').toUpperCase();
            }
            graphData.push({
                date : getCycleByIndex(i, field.crop[0].name),
                value : cycleValues[i].length != 0 ? average(cycleValues[i]) : NaN,
            })
        }
    }

    if (graphType == "yearly") {
        if (pixelValues.length != 0) {await setAvgPixelValueBatch(pixelValues); revalidatePath(`/app/fields/${field.id}`)}
    }else {
        pixelValues = []
    }
    return {graphData , lasthex}
}

export {getGraphData}