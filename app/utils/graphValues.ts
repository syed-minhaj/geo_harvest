import { tcrop, tfield , ImageType } from "@/app/types";
//import sharp from "sharp";
import { getColorPalette as colorRamp } from "./Script";
import { getDateShort } from "./Date";

type rampRGB = {
    value : number,
    r : number,
    g : number,
    b : number,
}[]


const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
};

function findClosestValue(r: number, g: number, b: number ,  rampRGB : rampRGB) {
    let closestValue: number | null = null;
    let minDist = Infinity;
    for (let i = 0; i < rampRGB.length; i++) {
        const c = rampRGB[i];
        const dr = r - c.r;
        const dg = g - c.g;
        const db = b - c.b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) {
            minDist = dist;
            closestValue = c.value;
        }
    }
    return closestValue;
}

async function getAverageRampValueFromUrl(imageUrl: string , imageType : ImageType , rampRGB : rampRGB): Promise<number | null> {

    const img = await loadImage(imageUrl);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let sum = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a === 0) continue; 

        const val = findClosestValue(r, g, b , rampRGB);
        if (val !== null && val !== undefined) {
            sum += val;
            count++;
        }
    }

    if (count === 0) return null;
    return imageType ==="cropStress" ? (sum / count) : (sum / count) / 0.6;
}

function findClosestColorFromHex(target:number , colorRamp : number[][] , imageType : ImageType) {
    // target must be from 0 to 1
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

async function getGraphData(field : tfield  , graphType : "yearly" | "periodly" , ImageType : ImageType) {
    const rampRGB =  colorRamp(ImageType).map(([value, intColor]) => {
        const r = (intColor >> 16) & 255;
        const g = (intColor >> 8) & 255;
        const b = intColor & 255;
        return { value, r, g, b };
    });
    const graphData = []
    let lasthex = "#0ADD08";
    const noOfValues = Object.keys(field.imagesDates).length;

    if (graphType == "yearly"){
        for(let i = noOfValues-1 ; i >= 0 ; i--) {
            const a = await getAverageRampValueFromUrl(`https://gjrjmfbkexmuhyaajypa.supabase.co/storage/v1/object/public/field/${field.id}/${field.imagesDates[i]}/${ImageType}.png`,ImageType , rampRGB)
            if(a !== null) {
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
                const a = await getAverageRampValueFromUrl(`https://gjrjmfbkexmuhyaajypa.supabase.co/storage/v1/object/public/field/${field.id}/${field.imagesDates[i]}/${ImageType}.png`,ImageType , rampRGB)
                if(a !== null) valuesOfMonth.push(a)
            }else if(valuesOfMonth.length != 0){
                graphData.push({
                    date : JSON.stringify(graphData.length + 1),
                    value : average(valuesOfMonth) ,
                })
                lasthex ="#" + findClosestColorFromHex(average(valuesOfMonth) , colorRamp(ImageType) , ImageType).toString(16).padStart(6,'0').toUpperCase();
                valuesOfMonth = []
                i++
            }else {
                const a = await getAverageRampValueFromUrl(`https://gjrjmfbkexmuhyaajypa.supabase.co/storage/v1/object/public/field/${field.id}/${field.imagesDates[i]}/${ImageType}.png`,ImageType , rampRGB)
                if(a !== null) valuesOfMonth.push(a)
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

    return {graphData , lasthex}
}

export {getGraphData}