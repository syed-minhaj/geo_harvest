import { db } from '@/app/lib/drizzle';
import { auth } from '@/app/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Main from './components/Main';
import Link from 'next/link';


type PageProps = Promise<{
    id : string
}>

async function getFieldById(id : string) {
    const f = await db.query.field.findFirst({
        where: (field , {eq}) => (eq(field.id , id)),
        with:{
            avgPixelValue : {
                columns : {
                    fieldId : true,
                    imageType : true,
                    imageDate : true,
                    value : true,
                }
            }
        }
    })
    if(!f){
        return null;
    }
    f.imagesDates = f.imagesDates.reverse();
    return f;
}


export default async function FieldPage({params} : {params : PageProps}) {
    
    const {id} = await params;
    const session = await auth.api.getSession({headers : await headers()});
    if (!session) {
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
    if(field.ownerId !== session.user.id) {
        redirect("/app/fields");
    }

    return (
        <main className="min-h-screen flex flex-col  gap-4 p-4 w-full">
            <Main  field={field} />
        </main>
    )
}