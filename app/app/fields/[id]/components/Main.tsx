"use client"
import { ImageType, tfield } from "@/app/types";
import dynamic from "next/dynamic"
import Config from "./Config";
import { Button } from "@/app/components/ui/button";
import { DeleteField as DeleteFieldAction } from "@/app/actions/field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { ChevronRight, Settings2 } from "lucide-react";
import { useHash } from "@/app/hooks/hash";
import {ChevronLeft } from "lucide-react"
import { useState } from "react";

const MapClient = dynamic(() => import("./MapClient") , { ssr : false});
const Graph = dynamic(() => import("./graph") , { ssr : false});

type avgPixelValue = {
    fieldId : string,
    imageType : ImageType,
    imageDate : string,
    value : number | null,
}

export default function Main({field} : {field : tfield & {avgPixelValue : avgPixelValue[]}}) {
    const router = useRouter();
    const {hash} = useHash("")
    const [openMenu, setOpenMenu] = useState(false);

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
            <ChevronLeft strokeWidth={2} onClick={() => {setOpenMenu(!openMenu)}} size={32}
                className="absolute right-0 top-10 z-20 p-1 border corner-squircle rounded-l-xl bg-background cursor-pointer" />
            
            <div className={`bg-background w-full h-full absolute top-0 right-0 bottom-0 left-0 transform overflow-y-scroll ${openMenu ? "translate-x-0" : "translate-x-full"} 
                 transition-transform duration-300 z-200 p-4 pt-0 flex flex-col gap-4 `}>
                
                <ChevronRight strokeWidth={2} onClick={() => {setOpenMenu(!openMenu)}} size={32}
                    className="absolute left-0 top-10 z-20 p-1 border corner-squircle rounded-r-xl bg-background cursor-pointer" />
            
                <div className='w-full   flex flex-col gap-4  '>
                    <Config />
                    <div className={`w-full grid grid-cols-1 lg:grid-cols-2 gap-4 ${hash == "" ? "hidden" : ""}`}>
                        <Graph typeP="yearly" field={field} />
                        <div className="hidden lg:block">
                            <Graph typeP="periodly" field={field} />
                        </div>
                    </div>
                </div>
                <Popover >
                    <PopoverTrigger className="ml-auto rounded border flex flex-row items-center gap-2 p-2 ">
                        <Settings2/> Settings
                    </PopoverTrigger>
                    <PopoverContent className="w-fit z-300">
                        <Button  className='bg-destructive ml-auto hover:bg-destructive/85 ' onClick={() => {DeleteField()}}>
                            Delete field
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
        </>

    )
}