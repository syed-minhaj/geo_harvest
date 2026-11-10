'use client';

import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap, LayersControl  } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression   } from 'leaflet';
import { getUserLocation, getZoom } from '@/app/utils/coordinate';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import { useEffect, useState } from 'react';
import '@/app/style/map.css';
import { Button } from '@/app/components/ui/button';

type location = {
    latitude : number,
    longitude : number
}

const DEFAULT_CENTER: LatLngExpression = [30.3753, 69.3451];
const DEFAULT_ZOOM = 5;

function Recenter({ lat, lng, zoom } : { lat : number, lng : number, zoom : number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], zoom);
    }, [map, lat, lng, zoom]);
    return null;
}

export default function MapClient({cordinates , setCordinates} : {cordinates : number[][] | null , setCordinates : (c : number[][] | null) => void}) {

    const [location, setLocation] = useState<location | null>(null);
    const [err, setErr] = useState<string | null>(null);

    function getLocation () {
        getUserLocation().then(({location, err}) => {
            setLocation(location);
            setErr(err);
        })
    }

    useEffect(() => {
        getLocation();
    }, []);


    if (err) {
        return  (
            <div className='w-full h-[30rem] 2xl:h-[35rem] rounded-[0.75rem] z-20 corner-squircle bg-muted flex flex-col gap-4 justify-center items-center relative'>
                <div className='max-w-[80%] text-center'>{err}</div>
                <div className="flex gap-3">
                    <Button onClick={() => {setErr(null); setLocation(null); getLocation()}}>Allow Location Access</Button>
                    <Button variant="outline" onClick={() => {setErr(null); setLocation(null);}}>Find Location Manually</Button>
                </div>
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

    const shape = async (data : any) => {
        const c = data.geometry.coordinates[0].map((c: number[]) => [c[0], c[1]]);
        setCordinates(c);
    }


    return (
        <MapContainer
            center={cordinates ? centerOfCoordinates(cordinates) : DEFAULT_CENTER}
            zoom={cordinates ? getZoom(cordinates) : DEFAULT_ZOOM}
            scrollWheelZoom={true} maxZoom={21} style={{}} className='w-full h-[30rem] 2xl:h-[35rem] rounded-[0.75rem] z-20 corner-squircle ' >
            <LayersControl position="bottomright">
                <LayersControl.BaseLayer checked name="Esri (fresher)">
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        maxNativeZoom={17}
                        maxZoom={21}
                        attribution="Tiles © Esri"
                        />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Google">
                    <TileLayer
                        url="https://mt{s}.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
                        subdomains={["0", "1", "2", "3"]}
                        maxZoom={21}
                        attribution="© Google"
                        />
                </LayersControl.BaseLayer>
            </LayersControl>
            {location && <Recenter lat={location.latitude} lng={location.longitude} zoom={18} />}
            <FeatureGroup>
                {cordinates && <Polygon color="#2F7D9E" positions={cordinates.map((c:any) => [c[1], c[0]])} />}
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
