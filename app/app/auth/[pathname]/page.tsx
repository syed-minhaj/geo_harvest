
import { authViewPaths } from "@daveyplate/better-auth-ui/server"
import { AuthCard } from "@daveyplate/better-auth-ui"

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(authViewPaths).map((pathname) => ({ pathname }))
}

export default async function AuthPage({ params }: { params: Promise<{ pathname: string }> }) {
    const { pathname } = await params

    return (
        <main className="flex grow  flex-col items-center justify-center gap-3 self-center p-4 md:p-6 mt-4">
            <AuthCard pathname={pathname} redirectTo="/app/fields"/>
        </main>
    )
}