import { Separator } from "@/app/components/ui/separator";
import { getDateShort } from "@/app/utils/Date";


const SwitchDate = ({dates , imagesDate , setImagesDate} : {dates : string[] , imagesDate : string , setImagesDate : React.Dispatch<React.SetStateAction<string>>}) => {
    return (
        <div className='w-full  bottom-0 p-4 absolute object-top z-1000 '>
            <div className=' w-full custom-scrollbar overflow-x-auto rounded-[0.5rem] text-white bg-[#28282b]/66 flex flex-row-reverse gap-2 p-2  '>
                {dates.map((date , index) => {
                    return (
                        <>
                            {index != 0 ? <div><Separator orientation='vertical' className='bg-white '/></div> : null}
                            <button className={`rounded px-2 w-fit hover:bg-white/33 whitespace-nowrap ${date == imagesDate ? 'bg-white/33' : ''}`} 
                            onClick={() => setImagesDate(date)} key={index} >{getDateShort(new Date(date))}</button>
                        </>
                )})}
            </div>
        </div>
    )
}

export default SwitchDate;