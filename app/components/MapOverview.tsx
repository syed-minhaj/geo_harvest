'use client';

import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fromPostgresPolygon, getZoomForBounds } from '@/app/utils/coordinate';
import { LatLngExpression } from 'leaflet';
import { useMemo, useRef, useState, useEffect } from 'react';

type FieldData = {
    id: string;
    name: string;
    coordinates: string;
    ownerId: string;
    imagesDates: string[];
    created_at: Date;
    updated_at: Date;
};

const colors = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#0891b2', '#be185d'];

export function MapOverview({ fields }: { fields: FieldData[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(600);

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
                        <Polygon
                            key={field.id}
                            positions={positions}
                            color={colors[i % colors.length]}
                            fillOpacity={0.2}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
}
