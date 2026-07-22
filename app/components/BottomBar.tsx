"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import {LayoutDashboard , Leaf, BarChart   } from "lucide-react"
import { UserButton } from "@daveyplate/better-auth-ui"
 
const Pages = ["dashboard", "fields" , "analytics"] as const

const IconComponent = ({page}:{page : typeof Pages[number]}) => {
    if(page == "dashboard") return <LayoutDashboard size={20} className="font-medium"/>
    else if (page == "fields") return <Leaf size={20}/>
    else if(page == "analytics") return <BarChart size={20}/>
    else return <div className="h-5 w-5"/>
}

export default function BottomBar() {

    const pathname = usePathname()

    return (
        <div className="sm:hidden flex flex-row w-full h-16 px-4 bg-white dark:bg-[#262626] sticky bottom-0 justify-between items-center border-t border-black/20 dark:border-white/20">
            {Pages.map((page, index) => (
                <Link href={page === "dashboard" ? "/app" : `/app/${page}`} key={index} 
                    className={`  rounded-r1 border flex flex-col items-center text-sm 
                    hover:bg-bg1 hover:border-black/10 
                    ${(page === "dashboard" && (pathname === "/app" || pathname.split(`/app/`).at(-1) == page)) || (page !== "dashboard" && pathname.split(`/app/`).at(-1) == page) ? "bg-bg1  border-black/20 dark:border-white/20" : "border-transparent"} 
                    p-2 px-2 leading-none font-medium text-black/85 dark:text-white/85 `} >
                    <IconComponent page={page} />
                    <span className={`  `}>
                        {page.charAt(0).toUpperCase() + page.slice(1)}
                    </span>
                </Link>
            ))}
            <UserButton className="z-80" size={"icon"}  /> 
        </div>
    );
}