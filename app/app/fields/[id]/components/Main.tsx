"use client"
import { tfield } from "@/app/types";
import dynamic from "next/dynamic"
import Config from "./Config";
import { Button } from "@/app/components/ui/button";
import { DeleteField as DeleteFieldAction } from "@/app/actions/field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Settings2 } from "lucide-react";

const MapClient = dynamic(() => import("./MapClient") , { ssr : false});

export default function Main({field} : {field : tfield}) {
    const router = useRouter();

    function DeleteField() {
        toast.info("Do you want to delete this field ?", {
            id : "confirm",
            action : 
                {
                    label : "Yes",
                    onClick : () => {
                        toast.dismiss("confirm");
                        toast.loading("Deleting field" , {
                            id : "loading",
                        });
                        DeleteFieldAction({id : field.id}).then((res) => {
                            if(res && res.err) {
                                toast.error(res.err);
                                return;
                            }
                            toast.dismiss("loading");
                            toast.success("Successfully deleted");
                            router.push("/app/fields");
                        })
                    }
                }
            
        });
        
    }
    return (
        <>
            <MapClient field={field} />
            <div className='w-full rounded-[1.75rem] border  flex flex-col gap-4 p-4 '>
                <Config />
            </div>
            <Popover >
                <PopoverTrigger className="ml-auto rounded border flex flex-row items-center gap-2 p-2 ">
                    <Settings2/> Settings
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                    <Button  className='bg-destructive ml-auto hover:bg-destructive/85 ' onClick={() => {DeleteField()}}>
                        Delete field
                    </Button>
                </PopoverContent>
            </Popover>
        </>

    )
}