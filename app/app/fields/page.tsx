import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
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

export default async function page() {
    
    const session = await auth.api.getSession({headers : await headers()});
    if (!session) {
        return <div>Please login</div>
    }
   
    const fields = await getFieldsById(session.user.id);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4 max-w-6xl mx-auto ">
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
                            <span className='opacity-66 text-xs'>{new Date(field.imagesDates[0]).toDateString()}</span>
                        </div>
                        <div className='flex flex-row justify-between'>
                            <span className='font-medium text-sm'>Planted Date</span>
                            <span className='opacity-66 text-xs'>{field.crop[0].planted_at?.toDateString()}</span>
                        </div>
                    </div>
                </Link>
            ))}
            <Link href="/app/fields/create" className='bg-white dark:bg-secondary/15 rounded-[0.75rem] shadow-sm group p-4 
            border-2 border-dashed border-gray-300 dark:border-gray-500 hover:!border-gray-400 hover:shadow-lg flex flex-col gap-2 justify-center'>
                <span className='text-center text-2xl group-hover:font-semibold leading-none'>+</span>
                <span className='text-center '>Create a new field</span>
            </Link>
        </div>
    )
}