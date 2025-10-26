import { authViewPaths } from "@daveyplate/better-auth-ui/server"
import { headers } from "next/headers";
import Main from "./components/Main";

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(authViewPaths).map((pathname) => ({ pathname }))
}

export default async function AuthPage({ params }: { params: Promise<{ pathname: string }> }) {
    const { pathname } = await params
    const headersList = await headers();
    let referrerUrl = headersList.get('referer') || null;
    
    return (
        <Main referrerUrl={referrerUrl} pathname={pathname}  />
    )
}