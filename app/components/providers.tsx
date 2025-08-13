"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { Toaster } from "./ui/sonner";

import { authClient } from "../lib/auth-client"

export default function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
        <AuthUIProvider
            basePath="/app/auth"
            authClient={authClient}
            navigate={router.push}
            replace={router.replace}
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