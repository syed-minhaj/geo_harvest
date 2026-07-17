'use client';

import { MapContainer, TileLayer, Polygon, FeatureGroup , ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression ,LatLngBoundsExpression  } from 'leaflet';
import { getUserLocation } from "@/app/utils/coordinate";
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import { useEffect, useState } from 'react';
import '../style/map.css';

type location = {
    latitude : number,
    longitude : number
}


export default function MapClient({}) {
    
    const [location, setLocation] = useState<location | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        getUserLocation().then(({location, err}) => {
            setLocation(location);
            setErr(err);
        })
    }, []);

    const [overlayUrl, setOverlayUrl] = useState<string | null>(null);
    const [overlayBounds, setOverlayBounds] = useState<LatLngBoundsExpression | null>(null);

    if (err || !location) {
        return  (
            <div>{err}
                <button onClick={() => getUserLocation()}>Get User Location</button>
            </div>
        )
    }
    const position: LatLngExpression = [location.latitude, location.longitude]; // Center 
    
    const polygon: LatLngExpression[] = [
        [location.latitude + 0.001, location.longitude - 0.001], // Top Left
        [location.latitude + 0.001, location.longitude + 0.001], // Top Right
        [location.latitude - 0.001, location.longitude + 0.001], // Bottom Right
        [location.latitude - 0.001, location.longitude - 0.001], // Bottom Left
    ];


    const shape = async (data : any) => {
        const c = data.geometry.coordinates[0].map((c: number[]) => [c[0], c[1]]);
        console.log(c)
        // const res = await fetch('/api/sentinel', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(c),
        // });

        // if(res.status !== 200) {
        //     console.log(res);
        //     return;
        // }

        // const blob = await res.blob();
        // const imageUrl = URL.createObjectURL(blob);

        // const coords = data.geometry.coordinates[0].map((c: number[]) => [c[1], c[0]]); // Swap lng/lat to lat/lng differnt formate
        // const lats = coords.map((c:any) => c[0]);
        // const lngs = coords.map((c:any) => c[1]);
        // const south = Math.min(...lats);
        // const north = Math.max(...lats);
        // const west = Math.min(...lngs);
        // const east = Math.max(...lngs);

        // setOverlayUrl(imageUrl);
        // setOverlayBounds([[south, west], [north, east]]);
    }

    return (
        <MapContainer center={position} zoom={18} scrollWheelZoom={true} style={{}} className='w-full h-[27rem] rounded-[0.75rem] z-20' >
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="© OpenStreetMap contributors"
                />
            <Polygon positions={polygon} color="green" />
            {overlayUrl && overlayBounds && (
                <ImageOverlay url={overlayUrl} bounds={overlayBounds} opacity={0.55} />
            )}
            <FeatureGroup>
                <EditControl
                    position="topright"
                    onCreated={(e) => {
                        shape(e.layer.toGeoJSON());
                    }}
                    draw={{
                        marker: false,
                        polygon: true,
                        polyline: true,
                        circle: false,
                        rectangle: true,
                        circlemarker: false,
                    }}
                />
            </FeatureGroup>
        </MapContainer>
    );
}
