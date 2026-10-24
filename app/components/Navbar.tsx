"use client"
import {UserButton} from "@daveyplate/better-auth-ui"
import {LogoNav as Logo} from "./navbar/logo";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


const ThemeSwitcher = dynamic(() => import("./navbar/ThemeSwitch"), { ssr: false });

export   function Navbar({ showOnDesktop }: { showOnDesktop?: boolean }) {


    return (
        <nav className={`${showOnDesktop ? "" : "sm:hidden"} flex flex-row items-center h-16 px-4 w-full `}>
            <Link href={"/app"} className="mr-auto" >
                <Logo />
            </Link>
            <div className="ml-auto gap-4 flex flex-row">
                <ThemeSwitcher/>
                {/* <button onClick={subscribeUser}>
                    Enable Notifications
                </button> */}
                <UserButton className="z-80" size={"icon"}  /> 
            </div>
        </nav>
    )
    
} 


export  function HomeNavbar() {


    return (
        <nav className="flex flex-row flex-nowrap items-center justify-between h-20 px-5 max-w-6xl w-full mx-auto">
            <Link href="/app" className="shrink-0">
                <Logo />
            </Link>
            <div className="flex flex-row flex-nowrap items-center gap-3 shrink-0">
                <Link className="shrink-0" href='/app' >
                    <span className="h-10 px-5 inline-flex items-center gap-1.5 rounded-md bg-ink dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-[#333] dark:hover:bg-[#E5E5E5] active:scale-[0.98] transition-[background-color,transform] cursor-pointer whitespace-nowrap">
                        Try now
                        <ArrowRight className="w-4 h-4" />
                    </span>
                </Link>
                <ThemeSwitcher/>
            </div>
        </nav>
    )
}