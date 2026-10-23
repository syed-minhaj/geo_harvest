"use client";
import { Separator } from "@/app/components/ui/separator";
import { getDateShort } from "@/app/utils/Date";
import { Fragment, useEffect, useRef } from "react";


const SwitchDate = ({dates , imagesDate , setImagesDate , onVisibleDatesChange} : {dates : string[] , imagesDate : string , setImagesDate : React.Dispatch<React.SetStateAction<string>> , onVisibleDatesChange? : (dates : string[]) => void}) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const datesKey = dates.join("|");
    const sortedDates = [...dates].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

    useEffect(() => {
        const root = scrollerRef.current;
        if (!root || !onVisibleDatesChange) return;

        const visible = new Set<string>();
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                const date = (entry.target as HTMLElement).dataset.date;
                if (!date) continue;
                if (entry.isIntersecting) visible.add(date);
                else visible.delete(date);
            }
            const ordered = Array.from(visible).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
            onVisibleDatesChange(ordered);
        }, { root, rootMargin: "0px 200px", threshold: 0 });

        root.querySelectorAll<HTMLElement>("[data-date]").forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [datesKey, onVisibleDatesChange]);

    return (
        <div className='w-full  bottom-0 p-4 absolute object-top z-20 '>
            <div className="h-full w-full px-2 rounded-[0.5rem] text-white bg-[#0B120D]/75">
                <div ref={scrollerRef} className=' w-full custom-scrollbar overflow-x-auto  flex flex-row-reverse gap-2 py-2  '>
                    {sortedDates.map((date , index) => {
                        return (
                            <Fragment key={date}>
                                {index != 0 ? <div><Separator orientation='vertical' className='bg-white '/></div> : null}
                                <button className={`rounded px-2 w-fit hover:bg-white/30 whitespace-nowrap ${date == imagesDate ? 'bg-white/30' : ''}`} 
                                data-date={date} onClick={() => setImagesDate(date)}>{getDateShort(new Date(date))}</button>
                            </Fragment>
                    )})}
                </div>
            </div>
        </div>
    )
}

export default SwitchDate;