// app/api/sentinel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  {auth}  from '../../lib/auth';
import {NDMI_SCRIPT} from './utlils/NDMI-Script';
import getToken from './utlils/getToken';
import { input, output } from './utlils/body';

export async function POST(request : NextRequest) {

    const session = await auth.api.getSession(request);
    if (!session) {
            return new Response("Unauthorized", {
                status: 401,
                headers: { "Content-Type": "text/plain" },
            });
    }

    const {token , err} = await getToken();
    
    if (err) {
        return new Response("failed to get token", {
            status: 400,
            headers: { "Content-Type": "text/plain" },
        });
    }
   
    const coordinates = await request.json();

    if (!coordinates || coordinates.length === 0 ) {
        return new Response("No coordinates provided", {
            status: 400,
            headers: { "Content-Type": "text/plain" },
        });
    }
   
    const geometry = {
        type: "Polygon",
        coordinates: [coordinates] 
    };


    const sentinelRes = await fetch('https://services.sentinel-hub.com/api/v1/process', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: input(geometry),
            output: output,
            evalscript: NDMI_SCRIPT,
        }),
    });

    const img = await sentinelRes.arrayBuffer();

    return new Response(img, {
        headers: {
            'Content-Type': 'image/png',
        },
    });
}
