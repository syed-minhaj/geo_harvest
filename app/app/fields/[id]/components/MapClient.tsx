'use client';

import { MapContainer, TileLayer, Polygon, FeatureGroup , ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression ,LatLngBoundsExpression  } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect, useState } from 'react';
import '@/app/style/map.css';
import { ImageType, tfield } from '@/app/types';
import { useHash } from '@/app/hooks/hash';
import SwitchDate from './switchDate';
import { getColorPalette } from '@/data/colorPalette';
import { fromPostgresPolygon, getZoom } from '@/app/utils/coordinate';



export default function MapClient({field} : {field : tfield}) {
    
    const coordinates = fromPostgresPolygon(field.coordinates);
    const {hash, updateHash} = useHash("")

    const [imagesDate , setImagesDate] = useState<string>(field.imagesDates[0]);
    const [overlayBounds, setOverlayBounds] = useState<LatLngBoundsExpression | null>(null);
    const [position, setPosition] = useState<LatLngExpression | null>(null);

    useEffect(() => {
        const lats = coordinates.map((c:any) => c[0]);
        const lngs = coordinates.map((c:any) => c[1]);
        const south = Math.min(...lats);
        const north = Math.max(...lats);
        const west = Math.min(...lngs);
        const east = Math.max(...lngs);
        setOverlayBounds([[south, west], [north, east]]);
        setPosition([(north + south)/2, (east + west)/2]); // Center
    },[])
    
    if(!position){
        return  (
            <div>Please wait...</div>
        )
    }
    

    function getImageUrl(date : string , type : string) {
        return `https://gjrjmfbkexmuhyaajypa.supabase.co/storage/v1/object/public/field/${field.id}/${date}/${type}.png`
    }


    const colors = getColorPalette(hash as ImageType);
    const gradient = `linear-gradient(to top, ${colors.join(",")})`;

    return (
        <div className='relative'>    
            <MapContainer center={position} zoom={getZoom(coordinates)} scrollWheelZoom={true} style={{}} className='w-full  h-[27rem] rounded-[1.75rem] z-20 ' >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="© OpenStreetMap contributors"
                    />
                {overlayBounds && hash ?
                    <ImageOverlay url={getImageUrl(imagesDate , hash)}
                    bounds={overlayBounds} opacity={0.55} />
                    :
                    <Polygon positions={coordinates as LatLngExpression[]} color="white" fillOpacity={0.15} fillColor="white" /> 
                }
                <FeatureGroup>
                </FeatureGroup>
            </MapContainer>
            <SwitchDate dates={field.imagesDates} imagesDate={imagesDate} setImagesDate={setImagesDate} />
            <div className="absolute right-2 top-0 h-full   shadow-lg rounded-xl p-2 flex flex-col items-center">
                <div
                    className="w-3 h-60 rounded-full z-500 my-auto "
                    style={{ background: gradient }}
                />
            </div>
        </div>
    );
}
