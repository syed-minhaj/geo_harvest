
import Link from 'next/link';
import {Fields , FieldsLoader} from './components/fileds';
import { Suspense } from 'react';


export default async function page() {
   
    return (
        <Suspense fallback={<FieldsLoader />}>
            <Fields />
        </Suspense>
    )
}