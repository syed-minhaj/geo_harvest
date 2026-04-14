"use server";
import { tfield , ImageType } from "@/app/types";
import { getDateShort } from "../utils/Date";
import { getAverageRampValueFromUrl_Server, revalidatePath_fromClient, setAvgPixelValueBatch } from "./actions";
import { revalidatePath } from "next/cache";
import { getColorRamp } from "../utils/colorRamp";
import { getAgriCycle, getCycleByIndex } from "../utils/agriCycle";

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
    
    const rampRGB =  getColorRamp(field.crop[0].name , ImageType , field.crop[0].planted_at).map(([value, intColor]) => {
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

    let lasthex = "#0ADD08";
    const noOfValues = Object.keys(field.imagesDates).length;

    if (graphType == "yearly"){
        for(let i = noOfValues-1 ; i >= 0 ; i--) {
            const a = dateToValue[field.imagesDates[i]] ?? await getAverageRampValueFromUrl(field.id , field.imagesDates[i] , ImageType , rampRGB)
            if(a !== null && !Number.isNaN(a)) {
                lasthex ="#" + findClosestColorFromHex(a , getColorRamp(field.crop[0].name , ImageType , field.crop[0].planted_at) , ImageType).toString(16).padStart(6, '0').toUpperCase();
                graphData.push({
                    date :  getDateShort(new Date(field.imagesDates[i])),
                    value : a < 0 ? 0 : a,
                })
            }else{
                graphData.push({
                    date :  getDateShort(new Date(field.imagesDates[i])),
                    value : NaN,
                })
            }
        }
    }
    
    else{
        let valuesOfCycle :number[] = []
        for(let i = noOfValues-1 ; i >= 0 ; i--) {
            const cycleOfCurrentValue = getAgriCycle(new Date(field.imagesDates[i]) , field.crop[0].name , field.crop[0].planted_at);
            const cycleOfLastValue = getAgriCycle(new Date(field.imagesDates[i+1]) , field.crop[0].name , field.crop[0].planted_at) ?? "no_last_value";
            
            if (cycleOfCurrentValue === cycleOfLastValue) {
                const a = dateToValue[field.imagesDates[i]] ?? await getAverageRampValueFromUrl(field.id , field.imagesDates[i] , ImageType , rampRGB)
                if(a !== null && !Number.isNaN(a)) valuesOfCycle.push(a < 0 ? 0 : a)
            }else if(valuesOfCycle.length != 0){
                graphData.push({
                    date : getCycleByIndex(graphData.length  , field.crop[0].name),
                    value : average(valuesOfCycle) ,
                })
                lasthex ="#" + findClosestColorFromHex(average(valuesOfCycle) , getColorRamp(field.crop[0].name , ImageType , field.crop[0].planted_at) , ImageType).toString(16).padStart(6,'0').toUpperCase();
                valuesOfCycle = []
                i++
            }else {
                const a = dateToValue[field.imagesDates[i]] ?? await getAverageRampValueFromUrl(field.id , field.imagesDates[i] , ImageType , rampRGB)
                if(a !== null && !Number.isNaN(a)) valuesOfCycle.push(a < 0 ? 0 : a)
            }
        
        }
        if (valuesOfCycle.length != 0){
            graphData.push({
                date : getCycleByIndex(graphData.length  , field.crop[0].name),
                value : average(valuesOfCycle),
            })
            lasthex ="#" + findClosestColorFromHex(average(valuesOfCycle) , getColorRamp(field.crop[0].name , ImageType , field.crop[0].planted_at) , ImageType).toString(16).padStart(6, '0').toUpperCase();
            valuesOfCycle = []
        }

        let noOfPeriods = 4
        noOfPeriods = noOfPeriods - graphData.length
        for(let i = 1 ; i <= noOfPeriods ; i++) {
            graphData.push({
                date : getCycleByIndex(i + graphData.length - 1, field.crop[0].name),
                value : NaN,
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