"use client";
import { getDateShort } from "@/app/utils/Date";
import { useEffect, useRef } from "react";


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
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
            <div className="pointer-events-auto flex w-full max-w-[min(94vw,52rem)] items-center gap-3 rounded-xl border border-white/10 bg-[#111111]/70 pl-4 pr-3 py-2 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
                <span className="flex-shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-white/40 select-none">
                    Date
                </span>
                <div ref={scrollerRef} className="datebar-scroller custom-scrollbar min-w-0 flex-1 overflow-x-auto flex flex-row-reverse items-center">
                    {sortedDates.map((date) => {
                        const active = date === imagesDate;
                        return (
                            <div key={date} className="flex items-center">
                                <button
                                    data-date={date}
                                    onClick={() => setImagesDate(date)}
                                    className={`whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-sm tracking-[0.02em] transition-[background-color,color,transform] duration-150 active:scale-[0.97] ${
                                        active
                                            ? "bg-white text-[#111111]"
                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                                >
                                    {getDateShort(new Date(date))}
                                </button>
                                <div className="h-5 w-px flex-shrink-0 bg-white/10" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default SwitchDate;