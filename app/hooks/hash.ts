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
        const effective = window.location.hash.slice(1) || defaultHash
        if (effective) {
            history.replaceState(history.state, "", `#${effective}`)
        }
        setHash(effective)

        const updateHashConst = () => {
            setHash(window.location.hash.slice(1))
        }
        window.addEventListener('hashchange', updateHashConst)
        return () => window.removeEventListener('hashchange', updateHashConst)
    }, [])

    return {hash , updateHash}
}