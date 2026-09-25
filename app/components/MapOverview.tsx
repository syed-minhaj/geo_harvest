'use client';

import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fromPostgresPolygon, getZoomForBounds } from '@/app/utils/coordinate';
import { LatLngExpression } from 'leaflet';
import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';

type FieldData = {
    id: string;
    name: string;
    coordinates: string;
    ownerId: string;
    imagesDates: string[];
    created_at: Date;
    updated_at: Date;
};

const colors = ['#2F7D9E', '#4E9E6B', '#D08A2E', '#C5574E', '#7D6FBE', '#3B8D89', '#B65D78'];

export function MapOverview({ fields }: { fields: FieldData[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(600);
    const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) setContainerWidth(entry.contentRect.width);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const { center, zoom } = useMemo(() => {
        const allCoords = fields.flatMap(f => fromPostgresPolygon(f.coordinates));
        if (!allCoords.length) return { center: [20, 0] as LatLngExpression, zoom: 2 };
        const lats = allCoords.map(c => c[0]);
        const lngs = allCoords.map(c => c[1]);
        const south = Math.min(...lats);
        const north = Math.max(...lats);
        const west = Math.min(...lngs);
        const east = Math.max(...lngs);
        const centerLat = (north + south) / 2;
        const latSpan = Math.abs(north - south);
        const lonSpan = Math.abs(east - west);
        return {
            center: [centerLat, (east + west) / 2] as LatLngExpression,
            zoom: getZoomForBounds(latSpan || 0.01, lonSpan || 0.01, centerLat, containerWidth, 300),
        };
    }, [fields, containerWidth]);

    return (
        <div ref={containerRef} className="w-full h-[300px] rounded-r1 overflow-hidden border border-input">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                />
                {fields.map((field, i) => {
                    const coords = fromPostgresPolygon(field.coordinates);
                    const positions: LatLngExpression[] = coords.map(([lat, lng]) => [lat, lng]);
                    return (
                        <div key={field.id}>
                            <Link
                                ref={el => {
                                    if (el) linkRefs.current.set(field.id, el);
                                }}
                                href={`/app/fields/${field.id}`}
                                aria-hidden="true"
                                className="hidden"
                            />
                            <Polygon
                                positions={positions}
                                pathOptions={{ color: colors[i % colors.length], fillOpacity: 0.2 }}
                                eventHandlers={{ click: () => linkRefs.current.get(field.id)?.click() }}
                            />
                        </div>
                    );
                })}
            </MapContainer>
        </div>
    );
}
