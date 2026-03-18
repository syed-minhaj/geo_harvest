import { db } from '@/app/lib/drizzle';
import Link from 'next/link';
import { calculateAreaInAcres } from '@/app/utils/area';
import { Separator } from '@/app/components/ui/separator';
import { fromPostgresPolygon } from '@/app/utils/coordinate';

async function getFieldsById(id: string) {
    return await db.query.field.findMany({
        where: (field , {eq}) => (eq(field.ownerId , id)),
        columns : {
            id : true,
            name : true,
            coordinates : true,
            ownerId : true,
            imagesDates : true,
        },
        with : {
            crop : {
                columns : {
                    name : true,
                    seedVariety : true,
                    planted_at : true,
                }
            }
        }
    });
}


function pgpolygontosvgPolygon(polygon: string, width = 150, height = 150, padding = 20) {
    // Remove outer parentheses and whitespace
    const cleaned = polygon.trim().replace(/^\(|\)$/g, '');
  
    // Match coordinate pairs and convert to numbers
    const matches = cleaned.match(/\(([^,)]+),([^)]+)\)/g);
    if (!matches || matches.length === 0) {
        return '';
    }
  
    // Parse coordinates into array of [x, y] pairs
    const coordinates = matches.map(match => {
        const coords = match.slice(1, -1).split(',');
        return [parseFloat(coords[0].trim()), parseFloat(coords[1].trim())];
    });
  
     // Find bounds
    const xs = coordinates.map(coord => coord[0]);
    const ys = coordinates.map(coord => coord[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
  
    // Calculate scale to fit within viewport with padding
    const dataWidth = maxX - minX;
    const dataHeight = maxY - minY;
    const scaleX = (width - 2 * padding) / dataWidth;
    const scaleY = (height - 2 * padding) / dataHeight;
    const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio
  
    // Scale and translate coordinates
    const scaledCoords = coordinates.map(([x, y]) => {
        const scaledX = (x - minX) * scale + padding;
        // Flip Y axis since SVG Y increases downward
        const scaledY = height - ((y - minY) * scale + padding);
        return `${scaledX.toFixed(2)},${scaledY.toFixed(2)}`;
    });
  
    return scaledCoords.join(' ');
}

export async function Fields({userID} : {userID : string}) {
    const fields = await getFieldsById(userID);
    return (
        <>
        {fields.map((field) => (
            <Link className={`p-4 rounded-[0.75rem] border-1  bg-white dark:bg-secondary/15 shadow-sm hover:shadow-lg dark:shadow-gray-900  flex flex-col gap-3 `}
            key={field.id} href={`/app/fields/${field.id}`}>
                <div className='flex flex-row gap-4'> 
                    <svg height={150} width={150}>
                        <polygon  points={pgpolygontosvgPolygon(field.coordinates)}  fill="green" stroke="#004C20" fillOpacity={0.25} strokeWidth="2" />
                    </svg>
                    <div className='flex flex-col gap-2'>
                        <h2 className='text-xl font-semibold '>
                            {field.name}
                        </h2>
                        <div className='flex flex-col '>
                            <span className='opacity-66'>Area:</span>
                            <span className='font-medium'>{calculateAreaInAcres(fromPostgresPolygon(field.coordinates)).toFixed(2)} acres</span>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className='text-sm flex flex-row '>
                    <div className='flex flex-col w-1/2 '>
                        <span className='opacity-66'>Crop:</span>
                        <span className='font-medium'>{field.crop[0].name}</span>
                    </div>
                    {field.crop[0].seedVariety != "other" ? 
                        <div className='flex flex-col w-1/2'>
                            <span className='opacity-66'>Variety:</span>
                            <span className='font-medium'>{field.crop[0].seedVariety}</span> 
                        </div> : null
                    }
                </div>
                <Separator />
                <div className='flex flex-col gap-1'>
                    <div className='flex flex-row justify-between'>
                        <span className='font-medium text-sm'>Latest Analysis</span>
                        <span className='opacity-66 text-xs'>{new Date(field.imagesDates[field.imagesDates.length - 1]).toDateString()}</span>
                    </div>
                    <div className='flex flex-row justify-between'>
                        <span className='font-medium text-sm'>Planted Date</span>
                        <span className='opacity-66 text-xs'>{field.crop[0].planted_at?.toDateString()}</span>
                    </div>
                </div>
            </Link>
        ))}
        </>
    )
}

function Skeleton({ className}: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-muted ${className}`}/>
    )
}

export function FieldsLoader() {
    return (
        <>
            {[...Array(2)].map((_, i) => (  
                <div className={`p-4 rounded-[0.75rem] border-1 bg-white dark:bg-secondary/15 shadow-sm hover:shadow-lg dark:shadow-gray-900 flex flex-col gap-3`}>
                    <div className='flex flex-row gap-4'>
                        <Skeleton className='rounded-[0.5rem] w-37 h-37 '  />
                        <div className='flex flex-col gap-2'>
                            <Skeleton className='h-6 w-32 rounded-md' />
                            <div className='flex flex-col gap-1'>
                                <Skeleton className='h-4 w-10 rounded-md' />
                                <Skeleton className='h-4 w-24 rounded-md' />
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className='text-sm flex flex-row'>
                        <div className='flex flex-col w-1/2 gap-1'>
                            <Skeleton className='h-4 w-10 rounded-md' />
                            <Skeleton className='h-4 w-20 rounded-md' />
                        </div>
                        <div className='flex flex-col w-1/2 gap-1'>
                            <Skeleton className='h-4 w-14 rounded-md' />
                            <Skeleton className='h-4 w-20 rounded-md' />
                        </div>
                    </div>
                    <Separator />
                    <div className='flex flex-col gap-1'>
                        <div className='flex flex-row justify-between'>
                            <Skeleton className='h-4 w-28 rounded-md' />
                            <Skeleton className='h-3 w-20 rounded-md' />
                        </div>
                        <div className='flex flex-row justify-between'>
                            <Skeleton className='h-4 w-24 rounded-md' />
                            <Skeleton className='h-3 w-20 rounded-md' />
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}