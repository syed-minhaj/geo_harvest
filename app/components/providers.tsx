"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { authClient } from "../lib/auth-client"
import { useEffect } from "react"

export default function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
    
    return (
        <AuthUIProvider
            basePath="/app/auth"
            authClient={authClient}
            navigate={router.push}
            replace={router.replace}
            redirectTo="/app/fields"
            onSessionChange={() => {
                router.refresh()
            }}
            Link={Link}
            social={{providers : ["google"]}}
            credentials={{
                passwordValidation: {
                    minLength: 8,
                },
                confirmPassword: true,
            }}
        >
            {children}
        </AuthUIProvider>
    )
}