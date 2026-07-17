import {Navbar} from "../../components/Navbar";
import SideBar from "../../components/SideBar";
import BottomBar from "../../components/BottomBar";

export default function DashboardLayout({
    children,
}:  Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main lang="en"  className="flex flex-row" >
            <SideBar />
            <div className="flex flex-col flex-1 min-w-0">
                <div className="min-h-screen pb-4 ">
                    <Navbar />
                    {children}
                </div>
                <BottomBar  />
            </div>
        </main>
    );
}
