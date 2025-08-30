"use client"
import {useHash}  from "@/app/hooks/hash"

function isActive(hash : string , value : string) {
    return hash == value ? "border-main bg-main/15" : "hover:bg-main/10 hover:border-main/65"
}

export default function Config() {
    const {hash, updateHash} = useHash("")
    function setHash(newHash : string) {
        if(hash == newHash) {
            updateHash("")
        }
        else {
            updateHash(newHash)
        }
    }
    return (
        <div className='w-full rounded-[1.75rem] border h-96 flex flex-col sm:flex-row gap-4 p-4 flex-wrap'>
            <button className={`${isActive(hash, "moistureLevel")} border rounded-[0.75rem] p-4 h-fit flex-1`} 
                    onClick={() => setHash("moistureLevel")}>
                moistureLevel
            </button>
            <button className={`${isActive(hash, "waterRequirement")} border rounded-[0.75rem] p-4 h-fit flex-1`}
                    onClick={() => setHash("waterRequirement")}>
                waterRequirement
            </button>
            <button className={`${isActive(hash, "cropHealth")} border rounded-[0.75rem] p-4 h-fit flex-1`}
                    onClick={() => setHash("cropHealth")}>
                cropHealth
            </button>
        </div>
    )
}