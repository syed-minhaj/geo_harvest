"use client"
import {  CreateField } from '@/app/actions/field';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Select, SelectContent, SelectValue , SelectTrigger, SelectGroup, SelectLabel, SelectItem } from '@/app/components/ui/select';
import { Crop as CropType , Variety as VarietyType } from '@/db/schema';
import { availableCrops } from '@/data/crop';
import { useRouter } from 'next/navigation';

const MapClient = dynamic(() => import("./components/MapClient"), { ssr: false });

export default function CreateFieldPage() {
    
    const [coordinates, setCoordinates] = useState<number[][] | null>(null);
    const [name , setName] = useState<string >("");
    const [crop, setCrop] = useState<CropType | undefined>();
    const [variety, setVariety] = useState<string>("other");
    const [plantedDate, setPlantedDate] = useState<string | undefined>();
    const [isCreating , setisCreating] = useState<boolean>(false);

    const router = useRouter();
    
    useEffect(() => {
        // if user 
        if(localStorage.getItem("createdField")){
            const data = JSON.parse(localStorage.getItem("createdField") as string);
            setName(data.name);
            setCrop(data.fcrop.name);
            setVariety(data.fcrop.variety);
            setPlantedDate(data.fcrop.plantedDate);
            setCoordinates(data.coordinates);
            localStorage.removeItem("createdField");
        }
    }, []);


    async function Submit () {
        if(coordinates && name && crop && plantedDate){
            toast.loading("Creating field" , {
                id : "loading",
            });
            setisCreating(true);
            const data = {name : name, coordinates : coordinates , fcrop : {name : crop , variety : variety ,plantedDate : plantedDate}}
            await CreateField({name : name, coordinates : coordinates , fcrop : {name : crop , variety : variety ,plantedDate : new Date(plantedDate)} }).then((res) => {
                if(res.err){
                    toast.dismiss("loading");
                    if(res.err == "Please login to create a field."){
                        localStorage.setItem("createdField" , JSON.stringify(data));
                        toast.error("Please Sign Up to create a field." , {
                            action : {
                                label : "Sign Up",
                                onClick : () => {
                                    router.push("/app/auth/sign-up")
                                }
                            }
                        });
                    }else{
                        toast.error(res.err);
                    }
                    return;
                }
                toast.dismiss("loading");
                toast.success("Successfully created",{
                    description : "You can now view your field",
                    action : {
                        label : "View",
                        onClick : () => {
                            router.push(`/app/fields/${res.data?.id}`)
                        }
                    }
                });
            });
        }else{
            toast.error("Please fill all details ");
        }
        setisCreating(false);
    }
    return (
        <main className="min-h-screen flex flex-col  gap-4 p-4 w-full">
            <div className='w-full lg:h-[27rem] flex flex-col lg:flex-row-reverse gap-4'>
                    <video  className='w-full  lg:w-1/3 lg:h-fit bg-gray-600 rounded-[0.75rem]' autoPlay loop muted>
                        <source src={`${process.env.APP_URL}/tutorial.mp4`} type="video/mp4"></source>
                    </video>
                <MapClient cordinates={coordinates} setCordinates={setCoordinates} />
            </div>
            <div className='flex flex-col sm:flex-row gap-4 '>
                <h3 className='text-xl font-bold font-josefin-sans w-fit'>Name of field : </h3>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='e.g. Field1' className='sm:w-[20rem]'/>
            </div>
            <Separator  />
            <div className='flex flex-col gap-4'>
                <h2 className='text-2xl font-bold font-josefin-sans'>Crops </h2>
                <div className='flex flex-col sm:flex-row gap-4'>
                    <Select disabled={isCreating} value={crop} onValueChange={(e) => {setCrop(e as CropType); console.log(e)}}>
                        <SelectTrigger className="w-full  sm:w-1/4">
                            <SelectValue placeholder="Select Crop" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Crop</SelectLabel>
                                {(Object.keys(availableCrops) as CropType[]).map((cropName : CropType) => (
                                    <SelectItem value={cropName} key={cropName}>
                                        {cropName}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    {crop ?
                        <>
                        {crop !== "other" ?
                            <Select disabled={isCreating} value={variety} onValueChange={(e) => {setVariety(e as VarietyType<typeof crop>)}}>
                                <SelectTrigger className="w-full sm:w-1/4">
                                    <SelectValue placeholder="Select variety" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>{crop} varity</SelectLabel>
                                        {(availableCrops[crop]).map((cropName : VarietyType<typeof crop>) => (
                                            <SelectItem value={cropName} key={cropName}>
                                                {cropName}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="other" key="other">Other</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>: null
                        }
                        <div className='flex flex-row items-center gap-2 w-full sm:w-1/2'>
                            <h4 className='font-medium font-josefin-sans '>Planted date : </h4>
                            <Input disabled={isCreating} type="date" value={plantedDate} onChange={(e) => setPlantedDate(e.target.value)}
                            placeholder='Planted date :' className='flex-1 max-w-1/2'/>
                        </div>
                        </>
                    : null}
                </div>
                <Button disabled={isCreating} className='sm:w-fit' onClick={Submit}>Create</Button>
            </div>
            <div className='w-full h-[2rem] '></div>
        </main>
    )
}