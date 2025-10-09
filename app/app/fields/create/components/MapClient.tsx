'use client';

import { MapContainer, TileLayer, FeatureGroup, Polygon  } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression   } from 'leaflet';
import { getUserLocation, getZoom } from '@/app/utils/coordinate';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import { useEffect, useState } from 'react';
import '@/app/style/map.css';

type location = {
    latitude : number,
    longitude : number
}


export default function MapClient({cordinates , setCordinates} : {cordinates : number[][] | null , setCordinates : (c : number[][] | null) => void}) {
    
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

    function centerOfCoordinates(coordinates : number[][]) {
        const lats = coordinates.map((c:any) => c[1]);
        const lngs = coordinates.map((c:any) => c[0]);
        const south = Math.min(...lats);
        const north = Math.max(...lats);
        const west = Math.min(...lngs);
        const east = Math.max(...lngs);
        return [(north + south)/2, (east + west)/2] as LatLngExpression;
    }

    const position: LatLngExpression = cordinates ? centerOfCoordinates(cordinates) : [location.latitude, location.longitude]; // Center 
    
    


    const shape = async (data : any) => {
        const c = data.geometry.coordinates[0].map((c: number[]) => [c[0], c[1]]);
        setCordinates(c);
    }


    return (
        <MapContainer center={position} zoom={cordinates ? getZoom(cordinates) : 18} scrollWheelZoom={true} style={{}} className='w-full lg:w-auto lg:flex-1 h-[27rem] rounded-[0.75rem] z-20' >
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="© OpenStreetMap contributors"
                />
            <FeatureGroup>
                {cordinates && <Polygon color="blue" positions={cordinates.map((c:any) => [c[1], c[0]])} />}
                <EditControl
                    position="topright"
                    onCreated={(e) => {
                        shape(e.layer.toGeoJSON());
                    }}
                    onDeleted={(e) => {
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
