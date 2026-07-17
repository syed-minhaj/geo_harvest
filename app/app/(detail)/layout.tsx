import {Navbar} from "../../components/Navbar";

export default function DetailLayout({
    children,
}:  Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main lang="en"  className="h-screen flex flex-col">
            <Navbar showOnDesktop={true} />
            <div className="flex-1 min-h-0 flex flex-col">
                {children}
            </div>
        </main>
    );
}
