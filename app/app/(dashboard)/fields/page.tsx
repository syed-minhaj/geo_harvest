import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { Fields, FieldsLoader } from "./components/fields";
import { Suspense } from "react";

export default async function FieldsPage() {
    return (
        <div className="flex flex-col gap-4 w-full px-4 overflow-x-hidden">
            <div className="flex flex-row items-center justify-between mt-4">
                <h1 className="text-xl font-semibold">Fields</h1>
                <Link href="/app/fields/create">
                    <Button>
                        <Plus />
                        Create Field
                    </Button>
                </Link>
            </div>
            <Suspense fallback={<FieldsLoader />}>
                <Fields />
            </Suspense>
        </div>
    )
}