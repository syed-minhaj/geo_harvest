import { db } from '@/app/lib/drizzle';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Main from './components/Main';
import Link from 'next/link';
import { crop, field } from '@/db/schema';
import { eq  } from 'drizzle-orm';

const default_fields = ["06402424-72fa-4b52-8d2f-6bd81c56c2bf" , "9eee4301-3096-4d44-9542-8c31dccb520d"];

type PageProps = Promise<{
    id : string
}>

async function getFieldById(id : string) {
    const f = await db.select({field , crop : {name: crop.name , planted_at : crop.planted_at }})
            .from(field).where(eq(field.id , id)).innerJoin(crop , eq(field.id , crop.fieldId)).execute();
    if(!f){
        return null;
    }
    const ff = {...f[0].field , crop :[f[0].crop]};
    ff.imagesDates = ff.imagesDates.reverse();
    return ff;
}


export default async function FieldPage({params} : {params : PageProps}) {
    
    const {id} = await params;
    const filedIsDefault = default_fields.includes(id)
    const session = await auth.api.getSession({headers : await headers()});
    if (!session && !filedIsDefault) {
        redirect("/app/auth/sign-in");
    }
    const field = await getFieldById(id);
    if(!field) {
        return (
            <div className="flex flex-col text-center mt-30 gap-4 mx-4 ">
                <h2 className="text-3xl">Field Not Found</h2>
                <p>The field you are looking for does not exist.</p>
                <Link href="/app/fields" className='opacity-66 hover:opacity-100'>View available fields</Link>
            </div>
        )
    }
    if(!filedIsDefault && field.ownerId !== session?.user.id) {
        redirect("/app/fields");
    }

    return (
        <main className="flex-1 flex flex-col  gap-4 px-2 pb-2 w-full min-h-0 relative overflow-hidden ">
            <Main  field={field} />
        </main>
    )
}