"use client"

import { useEffect, useState } from "react"
import Image from "next/image";

type tCard = {
    id: number,
    title: string,
    content: string,
    position: string,
    url: string
}

const CardStack = ({ cards } : { cards: tCard[] }) => {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        setIsHydrated(true)
    }, [])

    const handleMouseEnter = (cardId: number) => {
        setHoveredCard(cardId)
    }

    const handleMouseLeave = () => {
        setHoveredCard(null)
    }

    if (!isHydrated) {
        return (
            <div 
                className="w-full"
                suppressHydrationWarning={true}
            >
            </div>
        )
    }

    return (
        <div 
            className="w-4/6 md:w-full place-items-center card"
        >
            {cards.map((card) => {
                const isHovered = hoveredCard === card.id
                const rotation = isHovered ? { x: 0, y: 0 } : { x: 0, y: 20 }

                return (
                    <div
                        key={card.id}
                        className="cursor-pointer transition-all duration-500 ease-out shadow-2xl relative"
                        onMouseEnter={() => handleMouseEnter(card.id)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.05 : 1})`,
                            zIndex: isHovered ? 50 : 1
                        }}
                    >
                        {/* Main card */}
                        <div className="relative w-64 rounded-2xl overflow-hidden" style={{ height: '360px' }}>
                            {/* Base Image */}
                            <Image 
                                src={card.url} 
                                width={256} 
                                height={360} 
                                alt={card.title}
                                className="w-full h-full object-cover rounded-2xl border"
                                style={{ 
                                    boxShadow: '-4px 4px 25px 1px rgba(0, 0, 0, 0.25)' 
                                }}
                            />
                            
                            {/* Shine effect */}
                            <div
                                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent transition-opacity duration-300 pointer-events-none"
                                style={{
                                    opacity: isHovered ? 1 : 0
                                }}
                            />
                            
                            {/* Content overlay */}
                            <div 
                                className="absolute inset-0 p-4 rounded-2xl text-white flex flex-col justify-start transition-opacity duration-300"
                                style={{
                                    backgroundColor: 'rgba(17, 24, 39, 0.85)',
                                    opacity: isHovered ? 1 : 0,
                                    visibility: isHovered ? 'visible' : 'hidden'
                                }}
                            >
                                <h3 className="text-3xl font-bold my-3">{card.title}</h3>
                                <p className="text-lg" style={{ opacity: 0.85 }}>{card.content}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default CardStack