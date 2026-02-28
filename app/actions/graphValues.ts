"use server";
import { tfield , ImageType } from "@/app/types";
import { getColorPalette as colorRamp } from "../utils/Script";
import { getDateShort } from "../utils/Date";
import { getAverageRampValueFromUrl_Server, revalidatePath_fromClient, setAvgPixelValueBatch } from "./actions";

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

const pixelValues : {fieldId : string , imageType : ImageType , imageDate : string , value : number|null}[] = []

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

async function getGraphData(field : tfield & {avgPixelValue : avgPixelValue[]}  , graphType : "yearly" | "periodly" , ImageType : ImageType) {
    const rampRGB =  colorRamp(ImageType).map(([value, intColor]) => {
        const r = (intColor >> 16) & 255;
        const g = (intColor >> 8) & 255;
        const b = intColor & 255;
        return { value, r, g, b };
    });
    const avgPixelValues  = field.avgPixelValue.filter(({imageType}) => imageType == ImageType)
    
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
                lasthex ="#" + findClosestColorFromHex(a , colorRamp(ImageType) , ImageType).toString(16).padStart(6, '0').toUpperCase();
                graphData.push({
                    date :  getDateShort(new Date(field.imagesDates[i])),
                    value : a,
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
        let valuesOfMonth :number[] = []
        
        for(let i = noOfValues-1 ; i >= 0 ; i--) {
            const monthOfCurrentValue = new Date(field.imagesDates[i]).getMonth();
            const monthOfLastValue = new Date(field.imagesDates[i+1]).getMonth() ?? -1;
            if (monthOfCurrentValue === monthOfLastValue) {
                const a = dateToValue[field.imagesDates[i]] ?? await getAverageRampValueFromUrl(field.id , field.imagesDates[i] , ImageType , rampRGB)
                if(a !== null && !Number.isNaN(a)) valuesOfMonth.push(a)
            }else if(valuesOfMonth.length != 0){
                graphData.push({
                    date : JSON.stringify(graphData.length + 1),
                    value : average(valuesOfMonth) ,
                })
                lasthex ="#" + findClosestColorFromHex(average(valuesOfMonth) , colorRamp(ImageType) , ImageType).toString(16).padStart(6,'0').toUpperCase();
                valuesOfMonth = []
                i++
            }else {
                const a = dateToValue[field.imagesDates[i]] ?? await getAverageRampValueFromUrl(field.id , field.imagesDates[i] , ImageType , rampRGB)
                if(a !== null && !Number.isNaN(a)) valuesOfMonth.push(a)
            }
        
        }
        if (valuesOfMonth.length != 0){
            graphData.push({
                date : JSON.stringify(graphData.length + 1),
                value : average(valuesOfMonth),
            })
            lasthex ="#" + findClosestColorFromHex(average(valuesOfMonth) , colorRamp(ImageType) , ImageType).toString(16).padStart(6, '0').toUpperCase();
            valuesOfMonth = []
        }

        let noOfPeriods = 6
        noOfPeriods = noOfPeriods - graphData.length
        for(let i = 1 ; i <= noOfPeriods ; i++) {
            graphData.push({
                date : JSON.stringify(graphData.length + 1),
                value : NaN,
            })
        }
    }

    if (pixelValues.length != 0) {await setAvgPixelValueBatch(pixelValues); revalidatePath_fromClient(`/app/fields/${field.id}`)}
    return {graphData , lasthex}
}

export {getGraphData}