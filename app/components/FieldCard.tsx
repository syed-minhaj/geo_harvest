import Link from "next/link";
import { calculateAreaInAcres } from "@/app/utils/area";
import { fromPostgresPolygon } from "@/app/utils/coordinate";
import { Separator } from "@/app/components/ui/separator";

type CropInfo = {
    name: string;
    seedVariety: string;
    planted_at: Date | null;
};

type FieldCardProps = {
    id: string;
    name: string;
    coordinates: string;
    imagesDates: string[];
    crop: CropInfo | null;
};

function pgpolygontosvgPolygon(polygon: string, width = 220, height = 220, padding = 20) {
    const cleaned = polygon.trim().replace(/^\(|\)$/g, '');
    const matches = cleaned.match(/\(([^,)]+),([^)]+)\)/g);
    if (!matches || matches.length === 0) return '';
    const coordinates = matches.map(match => {
        const coords = match.slice(1, -1).split(',');
        return [parseFloat(coords[0].trim()), parseFloat(coords[1].trim())];
    });
    const xs = coordinates.map(coord => coord[0]), ys = coordinates.map(coord => coord[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const scale = Math.min((width - 2 * padding) / (maxX - minX), (height - 2 * padding) / (maxY - minY));
    const scaledCoords = coordinates.map(([x, y]) => {
        const sx = (x - minX) * scale + padding;
        const sy = height - ((y - minY) * scale + padding);
        return `${sx.toFixed(2)},${sy.toFixed(2)}`;
    });
    return scaledCoords.join(' ');
}

export function FieldCard({ id, name, coordinates, imagesDates, crop }: FieldCardProps) {
    const latestDate = imagesDates.length ? new Date(imagesDates[imagesDates.length - 1]).toDateString() : "No data";
    return (
        <Link href={`/app/fields/${id}`}
            className="p-4 rounded-r1 border bg-white dark:bg-secondary/15 shadow-sm hover:shadow-lg dark:shadow-gray-900/25 flex flex-col gap-3">
            <div className="flex flex-row gap-4">
                <svg height={220} width={220}>
                    <polygon points={pgpolygontosvgPolygon(coordinates)} fill="green" stroke="#004C20" fillOpacity={0.25} strokeWidth="2" />
                </svg>
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold min-w-24">{name}</h2>
                    <div className="flex flex-col">
                        <span className="opacity-66">Area:</span>
                        <span className="font-medium">{calculateAreaInAcres(fromPostgresPolygon(coordinates)).toFixed(2)} acres</span>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="text-sm flex flex-row justify-between">
                <div className="flex flex-col w-1/2">
                    <span className="opacity-66">Crop:</span>
                    <span className="font-medium capitalize">{crop?.name ?? "—"}</span>
                </div>
                {crop && crop.seedVariety != "other" ? (
                    <div className="flex flex-col w-1/2">
                        <span className="opacity-66">Variety:</span>
                        <span className="font-medium">{crop.seedVariety}</span>
                    </div>
                ) : null}
            </div>
            <Separator />
            <div className="flex flex-col gap-1">
                <div className="flex flex-row justify-between">
                    <span className="font-medium text-sm">Latest Analysis</span>
                    <span className="opacity-66 text-xs">{latestDate}</span>
                </div>
                <div className="flex flex-row justify-between">
                    <span className="font-medium text-sm">Planted Date</span>
                    <span className="opacity-66 text-xs">{crop?.planted_at ? new Date(crop.planted_at).toDateString() : "—"}</span>
                </div>
            </div>
        </Link>
    )
}
