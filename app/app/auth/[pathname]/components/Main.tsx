"use client"
import { AuthCard } from "@daveyplate/better-auth-ui"

export default function Main({referrerUrl , pathname}:{referrerUrl:string|null , pathname:string}) {
    
    const redirectPath = 
        (!referrerUrl || referrerUrl.split("app")[1].includes("auth")) ?
            (localStorage.getItem("referrerUrl")) ?
                "/app" + localStorage.getItem("referrerUrl")?.split("app")[1]
            : "app/fields"
        :
            "/app" + referrerUrl.split("app")[1]
        
    if (referrerUrl && !referrerUrl.split("app")[1].includes("auth")){
        localStorage.setItem("referrerUrl", referrerUrl)
    }
    
    return (
        <main className="flex grow  flex-col items-center justify-center gap-3 self-center p-4 md:p-6 mt-4">
            <AuthCard pathname={pathname} redirectTo={redirectPath} />
        </main>
    )
}