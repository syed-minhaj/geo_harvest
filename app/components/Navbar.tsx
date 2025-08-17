import {UserButton} from "@daveyplate/better-auth-ui"
import Logo from "./navbar/logo";
import ThemeSwitcher from "./ThemeSwitch";
import Link from "next/link";
import { Button } from "./ui/button";

export   function Navbar() {


    return (
        <nav className="flex flex-row items-center justify-center h-16 px-4 ">
            <Logo />
            <div className="ml-auto gap-4 flex flex-row">
                <ThemeSwitcher/>
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
                <Link className="" href='/app/getStarted' >
                    <Button variant={"link"}>Try Now</Button>
                </Link>
                <ThemeSwitcher/>
            </div>
        </nav>
    )
}