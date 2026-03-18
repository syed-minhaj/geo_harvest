
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";


export default function Tutorial({open , setOpen} : {open : boolean , setOpen : (open : boolean) => void}) {

    const instructions = [
        "Select a Tool: Click the rectangle or polygon icon from the drawing toolbar on the right side of the map.",
        "Draw the Shape: For a rectangle, click and drag over your field; for a polygon, click each corner and click the first point again to close the shape.",
        "Refine or Delete: Use the edit icon to adjust your boundaries or the trash icon to remove a shape if you need to start over."
    ]


    return (
        <Dialog open={open}>
            <DialogContent onDilogClose={() => setOpen(false)} className="flex flex-col items-center border-2 w-[95vw] max-w-4xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl">How to create a field</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col lg:flex-row gap-4 w-full max-w-full overflow-y-auto">
                    <ul className="flex flex-col gap-4 lg:flex-1 w-full shrink-0">
                        {instructions.map((instruction, index) => (
                            <li key={index} className="list-disc list-inside text-sm leading-relaxed">
                                {instruction}
                            </li>
                        ))}
                    </ul>
                    <div className="w-full lg:flex-1 shrink-0">
                        <video preload="auto" className="w-full h-auto rounded-xl" autoPlay loop muted >
                            <source src={`${process.env.NEXT_PUBLIC_APP_URL}/tutorial.mp4`} type="video/mp4" />
                        </video>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}