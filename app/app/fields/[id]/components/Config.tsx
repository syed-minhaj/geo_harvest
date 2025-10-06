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
        <div className='w-full grid grid-cols-2 lg:grid-cols-4 gap-4 '>
        {
            ["waterRequirement" , "nitrogenRequirement" , "phosphorusRequirement" , "cropStress"].map((imageType) => (
                <button className={`${isActive(hash, imageType)} border rounded-[0.75rem] p-4  flex-1 h-full`}
                    onClick={() => setHash(imageType)} key={imageType}>
                    {imageType.split("R")[0]}{imageType.split("R")[1] ? ` R${imageType.split("R")[1]}`: ""}
                </button>
            ))
        }
        </div>
    )
}