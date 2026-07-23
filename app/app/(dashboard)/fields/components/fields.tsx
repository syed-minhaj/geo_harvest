import { db } from '@/app/lib/drizzle';
import { Separator } from '@/app/components/ui/separator';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { or } from 'drizzle-orm';
import { FieldCard } from '@/app/components/FieldCard';

const default_fields =  await db.query.field.findMany({
    where: (field , {eq}) => (or(eq(field.id , "06402424-72fa-4b52-8d2f-6bd81c56c2bf") , eq(field.id , "9eee4301-3096-4d44-9542-8c31dccb520d"))),
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

async function getFields() {
    const session = await auth.api.getSession({headers : await headers()});
    if (!session) {
        return {data : default_fields , error : "Not logged in"}
    }

    const fields =  await db.query.field.findMany({
        where: (field , {eq}) => (eq(field.ownerId , session.user.id)),
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
    return {data : fields.concat(default_fields) , error : null}
    
}


export async function Fields() {
    const {data : fields , error} = await getFields();


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {fields.map((field) => (
                <FieldCard
                    key={field.id}
                    id={field.id}
                    name={field.name}
                    coordinates={field.coordinates}
                    imagesDates={field.imagesDates}
                    crop={field.crop[0] ?? null}
                />
            ))}
        </div>
    )
}

function Skeleton({ className}: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-muted ${className}`}/>
    )
}

export function FieldsLoader() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {[...Array(3)].map((_, i) => (  
                <div key={i} className={`p-4 rounded-r1 border bg-white dark:bg-secondary/15 shadow-sm hover:shadow-lg dark:shadow-gray-900 flex flex-col gap-3`}>
                    <div className='flex flex-row gap-4'>
                        <Skeleton className='rounded-[0.5rem] w-55 h-55 '  />
                        <div className='flex flex-col gap-2'>
                            <Skeleton className='h-6 w-24 rounded-md' />
                            <div className='flex flex-col gap-1'>
                                <Skeleton className='h-4 w-10 rounded-md' />
                                <Skeleton className='h-4 w-20 rounded-md' />
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className='text-sm flex flex-row h-10 w-70 justify-between'>
                        <div className='flex flex-col  gap-1'>
                            <Skeleton className='h-4 w-10 rounded-md' />
                            <Skeleton className='h-4 w-20 rounded-md' />
                        </div>
                        <div className='flex flex-col gap-1'>
                            <Skeleton className='h-4 w-14 rounded-md' />
                            <Skeleton className='h-4 w-20 rounded-md' />
                        </div>
                    </div>
                    <Separator />
                    <div className='flex flex-col gap-1 h-11 w-70'>
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
        </div>
    )
}