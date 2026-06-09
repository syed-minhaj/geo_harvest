
import {Fields } from './components/fileds';
import { FieldsLoader } from './components/fieldLoader';
import { Suspense } from 'react';


export default async function page() {
   
    return (
        <Suspense fallback={<FieldsLoader />}>
            <Fields />
        </Suspense>
    )
}