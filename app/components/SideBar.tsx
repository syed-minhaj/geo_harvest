"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {LayoutDashboard , Leaf, BarChart, MoveLeft, Moon, Sun  } from "lucide-react"
import { UserButton } from "@daveyplate/better-auth-ui"
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import Logo from "./navbar/logo";

const ThemeSwitcher = dynamic(() => import("./navbar/ThemeSwitch"), { ssr: false });
 
const Pages = ["dashboard", "fields" , "analytics"] as const

const IconComponent = ({page}:{page : typeof Pages[number]}) => {
    if(page == "dashboard") return <LayoutDashboard size={20} className="font-medium"/>
    else if (page == "fields") return <Leaf size={20}/>
    else if(page == "analytics") return <BarChart size={20}/>
    else return <div className="h-5 w-5"/>
}


export default function SideBar() {

    const [open, setOpen] = useState(true);
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    

    return (
        <div className={`${open ? "w-60" : "w-[4.375rem]"} hidden sticky top-0 h-screen bg-bg2 sm:flex flex-col  transition-[width] duration-300 ease-in-out sideBar-parent  `}>
            <div className="h-16 flex flex-row items-center pl-6 relative">
                <h1 className={`font-bold ${open ? "w-32" : "w-0"} overflow-hidden transition-[width] duration-300 ease-in-out logo `}>
                    <Logo />
                </h1>
                <MoveLeft className={` absolute right-[1.4375rem] top-1/2 -translate-y-1/2 p-1 text-black/85 dark:text-white/85 border border-black/20 dark:border-white/20 rounded  ${open ? "" : "rotate-180 "} `} 
                onClick={() => setOpen(!open)} />
            </div>
            <div className="px-4 flex flex-col gap-1 flex-1 group sideBar-child overflow-hidden">
                {Pages.map((page, index) => (
                    <Link href={page === "dashboard" ? "/app" : `/app/${page}`} key={index} 
                        className={` ${open ? "w-52 " : "w-[2.375rem]"} rounded-r1 border flex flex-row items-center  transition-[width] duration-300 ease-in-out 
                            group-hover:w-52 hover:bg-bg1 hover:border-black/10 
                        ${(page === "dashboard" && (pathname === "/app" || pathname.split(`/app/`).at(-1) == page)) || (page !== "dashboard" && pathname.split(`/app/`).at(-1) == page) ? "bg-bg1  border-black/20 dark:border-white/20" : "border-transparent"} 
                        p-2 px-2 leading-none font-medium text-black/85 dark:text-white/85 `} >
                        <IconComponent page={page} />
                        <span className={`${open ? "w-24" : "w-0 "} overflow-hidden whitespace-nowrap  transition-[width] duration-300 ease-in-out group-hover:w-24 `}>
                            &nbsp;{page.charAt(0).toUpperCase() + page.slice(1)}
                        </span>
                    </Link>
                ))}
                <div onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className={`mt-auto ${open ? "w-52 " : "w-[2.375rem]"} rounded-r1 border flex flex-row items-center transition-[width] duration-300 ease-in-out border-black/20 dark:border-white/20
                        group-hover:w-52 hover:bg-bg1  cursor-pointer mb-2
                        p-2 px-2 leading-none font-medium text-black/85 dark:text-white/85`} >
                    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    <span className={`${open ? "w-24" : "w-0 "} overflow-hidden whitespace-nowrap transition-[width] duration-300 ease-in-out group-hover:w-24`}>
                        &nbsp;{theme === "dark" ? "Light mode" : "Dark mode"}
                    </span>
                </div>
            </div>
            <div className="px-4 pb-4 flex flex-col items-center gap-2">
                <UserButton className="z-80" size={"icon"} />
            </div>
        </div>
    )
}