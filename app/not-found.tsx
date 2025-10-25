import Link from 'next/link';
import { HomeNavbar as Navbar } from "./components/Navbar";

export default function NotFound() {
    return (
        <div className='min-h-screen flex flex-col '>
            <Navbar />
            <div className='w-full flex-1  relative '>
                <div className='  bg-[url(/pg.png)] absolute top-0 left-0 right-0 bottom-0 opacity-10 bg-[-50px_0px] sm:bg-[-100px_0px]  '></div>
                <div className="flex flex-col text-center pt-30 gap-4 mx-4 ">
                    <h2 className="text-3xl">Page Not Found</h2>
                    <p>Could not find the requested page.</p>
                    <Link href="/app/fields" className='opacity-66 hover:opacity-100'>Return Home</Link>
                    {/* <div className="h-90 w-full bg-[url(/pg.png)] mx-auto my-20   ">

                    </div> */}
                </div>
            </div>
        </div>
    );
}