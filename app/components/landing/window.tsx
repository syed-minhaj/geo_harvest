export function WindowChrome({ title, className = "" }: { title: string; className?: string }) {
    return (
        <div
            className={`flex items-center gap-2 h-10 px-4 bg-white dark:bg-[#121714] border-b border-[#EAEAEA] dark:border-[#242D27] ${className}`}
        >
            <span className="flex gap-1.5" aria-hidden>
                <i className="w-2.5 h-2.5 rounded-full bg-[#E8E8E6] dark:bg-[#2A332C]" />
                <i className="w-2.5 h-2.5 rounded-full bg-[#E8E8E6] dark:bg-[#2A332C]" />
                <i className="w-2.5 h-2.5 rounded-full bg-[#E8E8E6] dark:bg-[#2A332C]" />
            </span>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#9B9B98] dark:text-[#6E7A71] truncate">
                {title}
            </span>
        </div>
    );
}
