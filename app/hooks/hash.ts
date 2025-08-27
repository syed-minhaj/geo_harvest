"use client"
import { useEffect, useState } from "react"

export function useHash(defaultHash : string) {
    const [hash, setHash] = useState<string>("")

    useEffect(() => {
        const updateHashConst = () => {
            setHash(window.location.hash.slice(1))
            if (window.location.hash.slice(1) == "") {
                updateHash(defaultHash)
            }
        }
        updateHashConst()
        window.addEventListener('hashchange', updateHashConst)
        return () => window.removeEventListener('hashchange', updateHashConst)
    }, [])

    const updateHash = (newHash : string) => {
        window.location.hash = newHash
    }

    return {hash , updateHash}
}