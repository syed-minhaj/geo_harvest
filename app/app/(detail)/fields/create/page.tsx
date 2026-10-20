"use client"
import {  CreateField } from '@/app/actions/field';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectValue , SelectTrigger, SelectGroup, SelectLabel, SelectItem } from '@/app/components/ui/select';
import { Crop as CropType , Variety as VarietyType } from '@/db/schema';
import { availableCrops } from '@/data/crop';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Tutorial from './components/Tutorial';

type FormErrors = {
    coordinates?: string;
    name?: string;
    crop?: string;
    plantedDate?: string;
};

const MapClient = dynamic(() => import("./components/MapClient"), {
    ssr: false,
    loading: () => <div className="w-full h-[30rem] 2xl:h-[35rem] rounded-[0.75rem] z-20 corner-squircle bg-muted animate-pulse " />,
});

export default function CreateFieldPage() {
    
    const [coordinates, setCoordinates] = useState<number[][] | null>(null);
    const [name , setName] = useState<string >("");
    const [crop, setCrop] = useState<CropType | undefined>();
    const [variety, setVariety] = useState<string>("other");
    const [plantedDate, setPlantedDate] = useState<string | undefined>();
    const [isCreating , setisCreating] = useState<boolean>(false);
    const [tutorialRequired, setTutorialRequired] = useState<boolean>(true);
    const [errors, setErrors] = useState<FormErrors>({});
    const [createdId, setCreatedId] = useState<string | null>(null);
    const [signUpOpen, setSignUpOpen] = useState<boolean>(false);

    const router = useRouter();
    
    useEffect(() => {
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
        const errs: FormErrors = {};
        if(!coordinates) errs.coordinates = "Draw your field on the map.";
        if(!name.trim()) errs.name = "Enter a name for your field.";
        if(!crop) errs.crop = "Select a crop.";
        if(!plantedDate) errs.plantedDate = "Select the planting date.";
        setErrors(errs);
        if(!coordinates || !name.trim() || !crop || !plantedDate){
            toast.error("Please fill all details ");
            return;
        }
        setisCreating(true);
        const data = {name : name, coordinates : coordinates , fcrop : {name : crop , variety : variety ,plantedDate : plantedDate}}
        await CreateField({name : name, coordinates : coordinates , fcrop : {name : crop , variety : variety ,plantedDate : new Date(plantedDate)} }).then((res) => {
            if(res.err){
                if(res.err == "Please sign in or sign up to create a field."){
                    localStorage.setItem("createdField" , JSON.stringify(data));
                    setSignUpOpen(true);
                }else{
                    toast.error(res.err);
                }
                return;
            }
            setCreatedId(res.data?.id ?? null);
        }).finally(() => {
            setisCreating(false);
        });
    }
    return (
        <main className="min-h-screen flex flex-col  gap-4 p-4 w-full">
            <div className='relative flex flex-col gap-1'>
                <MapClient cordinates={coordinates} setCordinates={(c) => {setCoordinates(c); setErrors(prev => ({...prev, coordinates: undefined}))}} />
                {errors.coordinates && <p className="text-sm text-destructive">{errors.coordinates}</p>}
            </div>
            {tutorialRequired && 
                <Tutorial open={tutorialRequired} setOpen={setTutorialRequired} />
            }
            <div className='flex flex-col sm:flex-row gap-4 '>
                <h3 className='text-xl font-bold font-josefin-sans w-fit'>Name of field : </h3>
                <div className='flex flex-col gap-1 w-full sm:w-[20rem]'>
                    <Input type="text" disabled={isCreating} value={name} onChange={(e) => {setName(e.target.value); setErrors(prev => ({...prev, name: undefined}))}} placeholder='e.g. Field1' className='w-full'/>
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
            </div>
            <Separator  />
            <div className='flex flex-col gap-4 pb-8'>
                <h2 className='text-2xl font-bold font-josefin-sans'>Crops </h2>
                <div className='flex flex-col sm:flex-row gap-4'>
                    <div className='flex flex-col gap-1 w-full sm:w-1/4'>
                        <Select disabled={isCreating} value={crop} onValueChange={(e) => {setCrop(e as CropType); setErrors(prev => ({...prev, crop: undefined}))}}>
                            <SelectTrigger className="w-full">
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
                        {errors.crop && <p className="text-sm text-destructive">{errors.crop}</p>}
                    </div>
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
                        <div className='flex flex-col gap-1 w-full sm:w-1/2'>
                            <div className='flex flex-row items-center gap-2'>
                                <h4 className='font-medium font-josefin-sans '>Planted date : </h4>
                                <Input disabled={isCreating} type="date" value={plantedDate} onChange={(e) => {setPlantedDate(e.target.value); setErrors(prev => ({...prev, plantedDate: undefined}))}}
                                placeholder='Planted date :' className='flex-1 max-w-1/2'/>
                            </div>
                            {errors.plantedDate && <p className="text-sm text-destructive">{errors.plantedDate}</p>}
                        </div>
                        </>
                    : null}
                </div>
                <Button disabled={isCreating} className='sm:w-fit' onClick={Submit}>{isCreating ? "Creating..." : "Create"}</Button>
            </div>
            <Dialog open={isCreating}>
                <DialogContent className="w-full max-w-sm" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Creating field</DialogTitle>
                        <DialogDescription>
                            Fetching satellite data for your field. This can take a moment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating field...
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={!isCreating && signUpOpen} onOpenChange={setSignUpOpen}>
                <DialogContent className="w-full max-w-md" onDilogClose={() => setSignUpOpen(false)}>
                    <DialogHeader>
                        <DialogTitle>Sign in required</DialogTitle>
                        <DialogDescription>
                            You need an account to create a field. Your field details have been saved so you can finish after signing in or signing up.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSignUpOpen(false)}>Cancel</Button>
                        <Button variant="outline" onClick={() => router.push("/app/auth/sign-in")}>Sign in</Button>
                        <Button onClick={() => router.push("/app/auth/sign-up")}>Sign up</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={!isCreating && createdId !== null} onOpenChange={(open) => { if(!open) setCreatedId(null) }}>
                <DialogContent className="w-full max-w-md" onDilogClose={() => setCreatedId(null)}>
                    <DialogHeader>
                        <DialogTitle>Field created</DialogTitle>
                        <DialogDescription>
                            {name} has been created and is ready to view.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreatedId(null)}>Close</Button>
                        <Button onClick={() => { if(createdId) router.push(`/app/fields/${createdId}`) }}>View field</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}