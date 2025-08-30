import dynamic from 'next/dynamic';
import { db } from '@/app/lib/drizzle';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Main from './components/Main';

//const MapClient = dynamic(() => import("./components/MapClient") , { ssr : false});

type PageProps = Promise<{
    id : string
}>

async function getFieldById(id : string) {
    return await db.query.field.findFirst({
        where: (field , {eq}) => (eq(field.id , id))
    })
}


export default async function FieldPage({params} : {params : PageProps}) {
    
    const {id} = await params;
    const session = await auth.api.getSession({headers : await headers()});
    if (!session) {
        redirect("/app/auth/login");
    }
    const field = await getFieldById(id);
    if(!field) {
        return <div>Field not found</div>
    }
    if(field.ownerId !== session.user.id) {
        redirect("/app/fields");
    }

    return (
        <main className="min-h-screen flex flex-col  gap-4 p-4 w-full">
            <Main  field={field} />
        </main>
    )
}