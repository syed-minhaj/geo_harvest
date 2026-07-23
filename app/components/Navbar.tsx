"use client"
import {UserButton} from "@daveyplate/better-auth-ui"
import {LogoNav as Logo} from "./navbar/logo";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "./ui/button";

const ThemeSwitcher = dynamic(() => import("./navbar/ThemeSwitch"), { ssr: false });

export   function Navbar({ showOnDesktop }: { showOnDesktop?: boolean }) {


    return (
        <nav className={`${showOnDesktop ? "" : "sm:hidden"} flex flex-row items-center h-16 px-4 w-full `}>
            <Link href={"/app/fields"} className="mr-auto" >
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
        <nav className="flex flex-row items-center justify-center h-16 px-4">
            <Logo />
            <div className="ml-auto gap-4 flex flex-row">
                <Link className="" href='/app' >
                    <Button variant={"link"}>Try Now</Button>
                </Link>
                <ThemeSwitcher/>
            </div>
        </nav>
    )
}