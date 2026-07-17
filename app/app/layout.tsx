import { Toaster } from "../components/ui/sonner";
import Providers from "../components/providers";

export default function AppLayout({
    children,
}:  Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Providers>
            {children}
            <Toaster position="top-center"/>
        </Providers>
    );
}
