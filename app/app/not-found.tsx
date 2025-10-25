import Link from 'next/link';

export default function NotFound() {
    return (
        <>
            <div className="flex flex-col text-center mt-30 gap-4 mx-4 ">
                <h2 className="text-3xl">Page Not Found</h2>
                <p>Could not find the requested page.</p>
                <Link href="/" className='opacity-66 hover:opacity-100'>Return Home</Link>
            </div>
        </>
    );
}