import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/app/lib/drizzle';
import Link from 'next/link';

async function getFieldsById(id: string) {
    return await db.query.field.findMany({
        where: (field , {eq}) => (eq(field.ownerId , id))
    });
}

function pgpolygontosvgPolygon(polygon: string, width = 300, height = 150, padding = 20) {
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
        <div className="flex flex-row justify-center  flex-wrap gap-4 p-4 ">
            {fields.map((field) => (
                <Link className={`p-4 rounded-[0.75rem] border-2 hover:bg-main/10 hover:border-main/65`}
                key={field.id} href={`/app/fields/${field.id}`}>
                    <svg >
                        <polygon points={pgpolygontosvgPolygon(field.coordinates)}  fill="green" stroke="black" fillOpacity={0.25} strokeWidth="2" />
                    </svg>
                    {field.name}
                </Link>
            ))}
        </div>
    )
}