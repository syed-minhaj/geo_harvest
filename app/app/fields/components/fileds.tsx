import { db } from '@/app/lib/drizzle';
import Link from 'next/link';
import { calculateAreaInAcres } from '@/app/utils/area';
import { fromPostgresPolygon } from '@/app/utils/coordinate';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { or } from 'drizzle-orm';

const default_fields = await db.query.field.findMany({
    where: (field, { eq }) => (or(eq(field.id, "06402424-72fa-4b52-8d2f-6bd81c56c2bf"), eq(field.id, "9eee4301-3096-4d44-9542-8c31dccb520d"))),
    columns: {
        id: true,
        name: true,
        coordinates: true,
        ownerId: true,
        imagesDates: true,
    },
    with: {
        crop: {
            columns: {
                name: true,
                seedVariety: true,
                planted_at: true,
            }
        },
        avgPixelValue: {
            columns: {
                imageType: true,
                value: true,
                imageDate: true,
            }
        }
    }
});

async function getFields() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return { data: default_fields, error: "Not logged in" }
    }

    const fields = await db.query.field.findMany({
        where: (field, { eq }) => (eq(field.ownerId, session.user.id)),
        columns: {
            id: true,
            name: true,
            coordinates: true,
            ownerId: true,
            imagesDates: true,
        },
        with: {
            crop: {
                columns: {
                    name: true,
                    seedVariety: true,
                    planted_at: true,
                }
            },
            avgPixelValue: {
                columns: {
                    imageType: true,
                    value: true,
                    imageDate: true,
                }
            }
        }
    });
    return { data: fields.concat(default_fields), error: null }
}

function pgpolygontosvgPolygon(polygon: string, width = 148, height = 130, padding = 12) {
    const cleaned = polygon.trim().replace(/^\(|\)$/g, '');
    const matches = cleaned.match(/\(([^,)]+),([^)]+)\)/g);
    if (!matches || matches.length === 0) return '';

    const coordinates = matches.map(match => {
        const coords = match.slice(1, -1).split(',');
        return [parseFloat(coords[0].trim()), parseFloat(coords[1].trim())];
    });

    const xs = coordinates.map(coord => coord[0]);
    const ys = coordinates.map(coord => coord[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const dataWidth = maxX - minX;
    const dataHeight = maxY - minY;
    const scaleX = (width - 2 * padding) / dataWidth;
    const scaleY = (height - 2 * padding) / dataHeight;
    const scale = Math.min(scaleX, scaleY);

    const scaledCoords = coordinates.map(([x, y]) => {
        const scaledX = (x - minX) * scale + padding;
        const scaledY = height - ((y - minY) * scale + padding);
        return `${scaledX.toFixed(2)},${scaledY.toFixed(2)}`;
    });

    return scaledCoords.join(' ');
}

function getLatestMetric(
    avgPixelValue: { imageType: string; value: number | null; imageDate: string }[],
    type: string
) {
    return avgPixelValue
        .filter(v => v.imageType === type)
        .sort((a, b) => b.imageDate.localeCompare(a.imageDate))[0]?.value ?? null;
}

function MetricCell({ label, value, unit }: { label: string; value: number | null; unit?: string }) {
    const display = value !== null ? `${value.toFixed(2)}${unit ?? ''}` : '—';
    const color =
        value === null ? 'text-muted-foreground' :
        value > 0.6 ? 'text-green-700 dark:text-green-400' :
        value > 0.35 ? 'text-amber-600 dark:text-amber-400' :
        'text-red-600 dark:text-red-400';

    return (
        <div className='flex flex-col gap-0.5 bg-muted/40 rounded-md px-3 py-2'>
            <span className='text-[10px] uppercase tracking-wide opacity-60'>{label}</span>
            <span className={`text-sm font-semibold font-mono ${color}`}>{display}</span>
        </div>
    );
}

function HealthBar({ label, value }: { label: string; value: number | null }) {
    const pct = value !== null ? Math.round(value * 100) : null;
    const barColor =
        pct === null ? 'bg-muted' :
        pct > 60 ? 'bg-green-500 dark:bg-green-600' :
        pct > 35 ? 'bg-amber-400 dark:bg-amber-500' :
        'bg-red-500 dark:bg-red-600';

    return (
        <div className='flex items-center gap-2'>
            <span className='text-xs opacity-60 w-28 shrink-0'>{label}</span>
            <div className='flex-1 h-1.5 bg-muted rounded-full overflow-hidden'>
                <div className={`h-full rounded-full ${barColor}`} style={{ width: pct !== null ? `${pct}%` : '0%' }} />
            </div>
            <span className='text-xs font-mono opacity-60 w-7 text-right'>{pct !== null ? `${pct}%` : '—'}</span>
        </div>
    );
}

export async function Fields() {
    const { data: fields } = await getFields();

    return (
        <div className='flex flex-col gap-4 p-4 max-w-4xl mx-auto w-full'>
            {fields.map((field) => {
                const water = getLatestMetric(field.avgPixelValue, 'waterRequirement');
                const nitrogen = getLatestMetric(field.avgPixelValue, 'nitrogenRequirement');
                const phosphorus = getLatestMetric(field.avgPixelValue, 'phosphorusRequirement');
                const stress = getLatestMetric(field.avgPixelValue, 'cropStress');
                const latestDate = field.imagesDates[field.imagesDates.length - 1];
                const crop = field.crop[0];
                const area = calculateAreaInAcres(fromPostgresPolygon(field.coordinates));

                return (
                    <Link
                        key={field.id}
                        href={`/app/fields/${field.id}`}
                        className='rounded-[0.75rem] border-1 bg-white dark:bg-secondary/15 shadow-sm hover:shadow-lg dark:shadow-gray-900 overflow-hidden flex flex-col'
                    >
                        <div className='flex flex-col sm:flex-row'>
                            <div className='bg-green-50 dark:bg-green-950/20 border-r border-border flex flex-col items-center justify-center gap-3 p-4 shrink-0'>
                                <svg width={148} height={130}>
                                    <polygon
                                        points={pgpolygontosvgPolygon(field.coordinates)}
                                        fill="green"
                                        stroke="#004C20"
                                        fillOpacity={0.25}
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <div className='flex flex-col gap-1 w-full'>
                                    <div className='flex justify-between text-[11px]'>
                                        <span className='opacity-60'>Area</span>
                                        <span className='font-mono font-medium text-green-800 dark:text-green-300'>{area.toFixed(1)} ac</span>
                                    </div>
                                    <div className='flex justify-between text-[11px]'>
                                        <span className='opacity-60'>Images</span>
                                        <span className='font-mono font-medium text-green-800 dark:text-green-300'>{field.imagesDates.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col gap-3 p-4 flex-1 min-w-0'>
                                <div className='flex items-start justify-between gap-2'>
                                    <div className="pb-3">
                                        <h2 className='text-lg font-semibold leading-tight'>{field.name}</h2>
                                    </div>
                                    <div className='flex gap-1.5 flex-wrap justify-end'>
                                        <span className='text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'>
                                            {crop.name}
                                        </span>
                                        {crop.seedVariety !== 'other' && (
                                            <span className='text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground'>
                                                {crop.seedVariety}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                                    <MetricCell label="Water req." value={water} />
                                    <MetricCell label="Nitrogen" value={nitrogen} />
                                    <MetricCell label="Phosphorus" value={phosphorus} />
                                    <MetricCell label="Crop stress" value={stress} />
                                </div>

                                <div className='flex flex-col gap-1.5'>
                                    <HealthBar label="Water requirement" value={water} />
                                    <HealthBar label="Nitrogen level" value={nitrogen} />
                                    <HealthBar label="Crop stress" value={stress !== null ? 1 - stress : null} />
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-3 border-t border-border text-sm'>
                            <div className='flex flex-col gap-0.5 px-4 py-3'>
                                <span className='text-[10px] uppercase tracking-wide opacity-60'>Planted</span>
                                <span className='font-medium text-xs'>{crop.planted_at?.toDateString() ?? '—'}</span>
                            </div>
                            <div className='flex flex-col gap-0.5 px-4 py-3 border-l border-r border-border'>
                                <span className='text-[10px] uppercase tracking-wide opacity-60'>Latest analysis</span>
                                <span className='font-medium text-xs'>{latestDate ? new Date(latestDate).toDateString() : '—'}</span>
                            </div>
                            <div className='flex flex-col gap-0.5 px-4 py-3'>
                                <span className='text-[10px] uppercase tracking-wide opacity-60'>Image history</span>
                                <div className='flex gap-1 mt-0.5'>
                                    {field.imagesDates.slice(-8).map((d, i) => (
                                        <div
                                            key={i}
                                            className='w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600 opacity-60'
                                            title={new Date(d).toDateString()}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}

            <Link href="/app/fields/create" className='bg-white dark:bg-secondary/15 rounded-[0.75rem] shadow-sm group p-4
                border-2 border-dashed border-gray-300 dark:border-border hover:!border-gray-400 hover:shadow-lg flex flex-col gap-2 justify-center'>
                <span className='text-center text-2xl group-hover:font-semibold leading-none'>+</span>
                <span className='text-center'>Create a new field</span>
            </Link>
        </div>
    );
}

