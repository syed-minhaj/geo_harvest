"use client"
import { useEffect, useState } from "react"

export function useHash(defaultHash : string) {
    const [hash, setHash] = useState<string>("")

    const updateHash = (newHash : string) => {
        const currentScrollY = window.scrollY;
        window.location.hash = newHash;
        window.scrollTo(0, currentScrollY);
    }

    useEffect(() => {
        const current = window.location.hash.slice(1)
        setHash(current)

        if (current == "" && defaultHash != "") {
            updateHash(defaultHash)
            setHash(defaultHash)
        }

        const updateHashConst = () => {
            setHash(window.location.hash.slice(1))
        }
        window.addEventListener('hashchange', updateHashConst)
        return () => window.removeEventListener('hashchange', updateHashConst)
    }, [])

    return {hash , updateHash}
}