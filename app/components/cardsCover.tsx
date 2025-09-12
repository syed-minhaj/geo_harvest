"use client"
import dynamic from "next/dynamic"

type tCard = {
    id : number,
    title : string,
    content : string,
    position : string,
    url : string
}

const Cards = dynamic(() => import("./cards"), { ssr: false })

const CardsCover = ({ cards } : { cards : tCard[] }) => {
    return (
        <Cards cards={cards}/>
    )
}

export default CardsCover