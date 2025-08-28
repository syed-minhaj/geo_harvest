'use server'
import { NDMI_SCRIPT } from '@/app/utils/NDMI-Script';

async function getToken(){

    const client_id = process.env.SENTINEL_CLIENT_ID;
    const client_secret = process.env.SENTINEL_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return {token : null , err : "Missing client id or client secret."};
    }

    try {
        const tokenRes = await fetch('https://services.sentinel-hub.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`,
        });
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;
        return {token : token , err : null};
    } catch (error ) {
        return {token : null , err : error};
    }
}

export async function sentinel_image({coordinates , date} : {coordinates : number[][] , date : string}) {
    
    if (!coordinates || coordinates.length === 0 ) {
        return {err : "No coordinates provided" , data: null};
    }

    const {token , err} = await getToken();
    
    if (err) {
        return {err : "backend error : contact admin." , data: null};
    }
   
   
    const geometry = {
        type: "Polygon",
        coordinates: [coordinates] 
    };

    const input = (geometry : any , date: string) => {
        
        return {
            bounds: {
                geometry: geometry,
                properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' },
            },
            data: [
                {
                    type: 'sentinel-2-l2a',
                    dataFilter: {
                        timeRange: {
                            from: date,
                            to: date,
                        },
                    },
                },
            ],
        }
    }

    const output = {
        width: 512,
        height: 512,
        responses: [
            {
                identifier: 'default',
                format: { type: 'image/png' },
            },
        ],
    }

    try{

        const sentinelRes = await fetch('https://services.sentinel-hub.com/api/v1/process', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: input(geometry , date),
                output: output,
                evalscript: NDMI_SCRIPT,
            }),
        });
        if(!sentinelRes.ok){
            console.log(sentinelRes);
            return {err : "backend error : contact admin." , data: null};
        }
        const buffer = await sentinelRes.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        return {err : null , data : bytes};
    }catch(e){
        console.log(e);
        return {err : "backend error : contact admin." , data: null};
    }

}


export async function sentinel_catalog({coordinates} : {coordinates : number[][]}) {
    
    if (!coordinates || coordinates.length === 0 ) {
        return {err : "No coordinates provided" , data: null};
    }
    
    const {token , err} = await getToken();
    
    if (err) {
        console.log(err);
        return {err : "backend error : contact admin." , data: null};
    }

    const geometry = {
        type: "Polygon",
        coordinates: [coordinates] 
    };

    const input = (geometry : {type : string , coordinates : number[][][]}) => {
    
        
        const today = new Date().toISOString();
        const from7daysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        return{
            "collections": ["sentinel-2-l2a"],
            "datetime": `${from7daysAgo}/${today}`,
            "limit": 10,
            // "sort": [
            //     { "field": "date", "direction": "desc" }
            // ],
            
            "intersects": geometry 
        };
    };
    try{
        const sentinelRes = await fetch("https://services.sentinel-hub.com/api/v1/catalog/1.0.0/search", {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input(geometry)),
        });
        return {err : null  ,data : await sentinelRes.json()};
    }catch(e){
        console.log(e);
        return {err : "backend error : contact admin." , data: null};
    }

}
