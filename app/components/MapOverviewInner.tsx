'use client';

import { MapContainer, TileLayer, Polygon, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fromPostgresPolygon, getZoomForBounds, getMinZoomForContainer } from '@/app/utils/coordinate';
import { DivIcon, Map as LeafletMap, LatLngBounds, LatLngExpression, latLngBounds } from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

const PIN_VISIBLE_BELOW_PX = 30;
const TILE_SIZE = 256;
const FLY_DURATION = 0.9;

const escapeHtml = (s: string) => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return s.replace(/[&<>"']/g, c => map[c]);
};

type FieldShape = {
    id: string;
    color: string;
    positions: LatLngExpression[];
    center: LatLngExpression;
    bounds: LatLngBounds;
    latSpan: number;
    lonSpan: number;
    centerLat: number;
    pin: DivIcon;
};

function buildFieldShapes(fields: FieldData[]): FieldShape[] {
    return fields.map((field, i) => {
        const coords = fromPostgresPolygon(field.coordinates);
        const lats = coords.map(c => c[0]);
        const lngs = coords.map(c => c[1]);
        const color = colors[i % colors.length];
        const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const positions = coords.map(([lat, lng]) => [lat, lng] as LatLngExpression);
        const pin = new DivIcon({
            className: 'field-glow-pin',
            html: `<div class="flex items-center">
                <svg width="16" height="16" viewBox="0 0 16 16" class="shrink-0 block">
                    <g class="orbit-spin">
                        <circle cx="8" cy="8" r="6.6" fill="none" stroke="${color}" stroke-opacity="0.45" stroke-width="1" stroke-dasharray="1.5 3.7"/>
                    </g>
                    <path class="pin-diamond" d="M8 3.4 L12.6 8 L8 12.6 L3.4 8 Z" fill="${color}" stroke="white" stroke-width="1.1"/>
                    <circle cx="8" cy="8" r="1.3" fill="white" fill-opacity="0.9"/>
                </svg>
                <span class="w-2 h-px bg-[#787774]/50 shrink-0"></span>
                <span class="field-tag whitespace-nowrap px-1.5 py-[3px] bg-white/95 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(20,20,20,0.10)] font-mono text-[9px] uppercase tracking-[0.08em] leading-none text-[#3A4239] pointer-events-none">${escapeHtml(field.name)}</span>
            </div>`,
            iconAnchor: [8, 8],
        });
        return {
            id: field.id,
            color,
            positions,
            center: [centerLat, lngs.reduce((a, b) => a + b, 0) / lngs.length] as LatLngExpression,
            bounds: latLngBounds(positions),
            latSpan: Math.max(...lats) - Math.min(...lats),
            lonSpan: Math.max(...lngs) - Math.min(...lngs),
            centerLat,
            pin,
        };
    });
}

function polygonPixelSize(shape: FieldShape, zoom: number) {
    const scale = (TILE_SIZE * Math.pow(2, zoom)) / 360;
    const secLat = 1 / Math.max(0.01, Math.cos((shape.centerLat * Math.PI) / 180));
    const latPx = shape.latSpan * scale * secLat;
    const lonPx = shape.lonSpan * scale;
    return Math.max(latPx, lonPx);
}

function ZoomTracker({ onZoom }: { onZoom: (zoom: number) => void }) {
    const map = useMap();
    useEffect(() => {
        onZoom(map.getZoom());
    }, [map, onZoom]);
    useMapEvents({
        zoomend: () => onZoom(map.getZoom()),
    });
    return null;
}

export function MapOverviewInner({ fields }: { fields: FieldData[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const [containerWidth, setContainerWidth] = useState<number | null>(null);
    const [zoom, setZoom] = useState<number | null>(null);
    const [focusedId, setFocusedId] = useState<string | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) setContainerWidth(entry.contentRect.width);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const { center, initialZoom } = useMemo(() => {
        if (containerWidth === null) return { center: [20, 0] as LatLngExpression, initialZoom: 2 };
        const allCoords = fields.flatMap(f => fromPostgresPolygon(f.coordinates));
        if (!allCoords.length) return { center: [20, 0] as LatLngExpression, initialZoom: 2 };
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
            initialZoom: getZoomForBounds(latSpan || 0.01, lonSpan || 0.01, centerLat, containerWidth, 300),
        };
    }, [fields, containerWidth]);

    const handleZoom = useCallback((z: number) => setZoom(z), []);

    const shapes = useMemo(() => buildFieldShapes(fields), [fields]);

    const focusField = useCallback((shape: FieldShape) => {
        const map = mapRef.current;
        if (!map) return;
        setFocusedId(shape.id);
        map.flyToBounds(shape.bounds, { padding: [56, 56], duration: FLY_DURATION, maxZoom: 17 });
    }, []);

    const showAllFields = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        const map = mapRef.current;
        if (!map) return;
        setFocusedId(null);
        map.flyTo(center, initialZoom, { duration: FLY_DURATION });
    }, [center, initialZoom]);

    return (
        <div ref={containerRef} className="relative w-full h-[300px] rounded-r1 overflow-hidden border border-input">
            {containerWidth !== null && (
                <MapContainer ref={mapRef} center={center} zoom={initialZoom} minZoom={Math.max(initialZoom, getMinZoomForContainer(300))} scrollWheelZoom={true} className="w-full h-full">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="Â© OpenStreetMap contributors"
                    />
                    <ZoomTracker onZoom={handleZoom} />
                    {shapes.map(shape => {
                        const isFocused = focusedId === shape.id;
                        const baseStyle = isFocused
                            ? { color: shape.color, weight: 2.5, fillOpacity: 0.42, opacity: 1 }
                            : focusedId
                                ? { color: shape.color, weight: 1, fillOpacity: 0.06, opacity: 0.35 }
                                : { color: shape.color, weight: 1.5, fillOpacity: 0.2, opacity: 1 };
                        return (
                            <Polygon
                                key={shape.id}
                                positions={shape.positions}
                                pathOptions={baseStyle}
                                eventHandlers={{
                                    click: () => focusField(shape),
                                    mouseover: e => e.target.setStyle({ weight: 3, fillOpacity: 0.45, opacity: 1 }),
                                    mouseout: e => e.target.setStyle(baseStyle),
                                }}
                            />
                        );
                    })}
                    {shapes.map(shape => (
                        zoom !== null && polygonPixelSize(shape, zoom) < PIN_VISIBLE_BELOW_PX ? (
                            <Marker
                                key={shape.id}
                                position={shape.center}
                                icon={shape.pin}
                                keyboard={false}
                                eventHandlers={{ click: () => focusField(shape) }}
                            />
                        ) : null
                    ))}
                </MapContainer>
            )}
            {focusedId && (
                <button
                    onClick={showAllFields}
                    className="absolute top-2 right-2 z-[1000] px-2 py-1 rounded-r1 border border-[#E4E2DB] bg-white/95 shadow-[0_1px_2px_rgba(20,20,20,0.10)] font-mono text-[9px] uppercase tracking-[0.08em] leading-none text-[#3A4239] hover:bg-white hover:text-[#141414] cursor-pointer transition-colors"
                >
                    Show all
                </button>
            )}
        </div>
    );
}
