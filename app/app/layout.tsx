import { Toaster } from "../components/ui/sonner";
import {Navbar} from "../components/Navbar";
import Providers from "../components/providers";


export default function AppLayout({
    children,
}:  Readonly<{
    children: React.ReactNode;
}>) {
    return (

        <main lang="en" className="flex flex-col h-screen ">
            <Providers>
                <Navbar />
                {children}
            </Providers>
            <Toaster position="top-center"/>
        </main>
    );
}