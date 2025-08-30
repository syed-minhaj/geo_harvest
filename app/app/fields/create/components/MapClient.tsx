'use client';

import { MapContainer, TileLayer, Polygon, FeatureGroup  } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression ,LatLngBoundsExpression  } from 'leaflet';
import { getUserLocation } from '@/app/utils/coordinate';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'minhaj-react-leaflet-draw';
import { useEffect, useState } from 'react';
import '@/app/style/map.css';

type location = {
    latitude : number,
    longitude : number
}


export default function MapClient({setCordinates} : {setCordinates : (c : number[][] | null) => void}) {
    
    const [location, setLocation] = useState<location | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        getUserLocation().then(({location, err}) => {
            setLocation(location);
            setErr(err);
        })
    }, []);


    if (err || !location) {
        return  (
            <div>{err}
                <button onClick={() => getUserLocation()}>Get User Location</button>
            </div>
        )
    }
    const position: LatLngExpression = [location.latitude, location.longitude]; // Center 
    
    


    const shape = async (data : any) => {
        const c = data.geometry.coordinates[0].map((c: number[]) => [c[0], c[1]]);
        setCordinates(c);
    }

    return (
        <MapContainer center={position} zoom={18} scrollWheelZoom={true} style={{}} className='w-full h-[27rem] rounded-[0.75rem] z-20' >
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="© OpenStreetMap contributors"
                />
            <FeatureGroup>
                <EditControl
                    position="topright"
                    onCreated={(e) => {
                        shape(e.layer.toGeoJSON());
                    }}
                    onDeleted={(e) => {
                        console.log(e);
                        setCordinates(null);
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
