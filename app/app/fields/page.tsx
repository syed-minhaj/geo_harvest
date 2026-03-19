
import Link from 'next/link';
import {Fields , FieldsLoader} from './components/fileds';
import { Suspense } from 'react';


export default async function page() {
   
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4 max-w-6xl mx-auto ">
            <Suspense fallback={<FieldsLoader />}>
                <Fields />
            </Suspense>
            <Link href="/app/fields/create" className='bg-white dark:bg-secondary/15 rounded-[0.75rem] shadow-sm group p-4 
            border-2 border-dashed border-gray-300 dark:border-border hover:!border-gray-400 hover:shadow-lg flex flex-col gap-2 justify-center'>
                <span className='text-center text-2xl group-hover:font-semibold leading-none'>+</span>
                <span className='text-center '>Create a new field</span>
            </Link>
        </div>
    )
}