'use client';

import { MapContainer, TileLayer, Polygon, FeatureGroup , ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression ,LatLngBoundsExpression  } from 'leaflet';
import { getUserLocation } from '@/app/utils/coordinate';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useEffect, useState } from 'react';
import '@/app/style/map.css';
import { tfield } from '@/app/types';
import { useHash } from '@/app/hooks/hash';

type location = {
    latitude : number,
    longitude : number
}

function fromPostgresPolygon(polygonString: string): number[][] {
  const cleanString = polygonString.replace(/^\(\(|\)\)$/g, '');
  
  const coordPairs = cleanString.split('),(');
  
  return coordPairs.map(pair => {
    const [x, y] = pair.split(',').map(Number);
    return [y, x];
  });
}


export default function MapClient({field} : {field : tfield}) {
    
    const coordinates = fromPostgresPolygon(field.coordinates);
    const {hash, updateHash} = useHash("")
    
    const [location, setLocation] = useState<location | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        getUserLocation().then(({location, err}) => {
            setLocation(location);
            setErr(err);
        })
    }, []);

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
    if (err || !location) {
        return  (
            <div>{err}
                <button onClick={() => getUserLocation()}>Get User Location</button>
            </div>
        )
    }
    

    function getImageUrl(date : string , type : string) {
        return `https://gjrjmfbkexmuhyaajypa.supabase.co/storage/v1/object/public/field/${field.id}/${date}/${type}.png`
    }

    function getZoom(coordinates : number[][]) {
        const lats = coordinates.map((c:any) => c[0]);
        const south = Math.min(...lats);
        const north = Math.max(...lats);
        return Math.log2(180/Math.abs(north - south)) + 1
    }
    return (
        <MapContainer center={position ?? undefined} zoom={getZoom(coordinates)} scrollWheelZoom={true} style={{}} className='w-full  h-[27rem] rounded-[1.75rem] z-20' >
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="© OpenStreetMap contributors"
                />
            {overlayBounds && hash ?
                <ImageOverlay url={getImageUrl(field.imagesDates[0] , hash)}
                bounds={overlayBounds} opacity={0.55} />
                :
                <Polygon positions={coordinates as LatLngExpression[]} color="white" fillOpacity={0.15} fillColor="white" /> 
            }
            <FeatureGroup>
            </FeatureGroup>
        </MapContainer>
    );
}
