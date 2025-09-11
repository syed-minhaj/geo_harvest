"use client"
import { useState, useEffect } from "react"
import Image from "next/image";

type tCard = {
  id : number,
  title : string,
  content : string,
  position : string,
  url : string
}

const CardStack = ({cards} : {cards : tCard[]}) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const handleMouseEnter = (cardId: number) => {
    setHoveredCard(cardId)
  }

  const handleMouseLeave = () => {
    setHoveredCard(null)
  }

  if (!isMounted || !isDesktop) {
    return null
  }

  return (
    <div className="w-full grid grid-cols-4 place-items-center gap-4">
      {cards.map((card) => {
        const isHovered = hoveredCard === card.id
        const rotation = isHovered ? { x: 0, y: 0 } : {x : 0, y : 20}
        
        return (
          <div
            key={card.id}
            className={`cursor-pointer transition-all duration-500 ease-out shadow-2xl hover:z-50`}
            onMouseEnter={() => handleMouseEnter(card.id)}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.05 : 1})`,
            }}
          >

            {/* Main card */}
            <div className="relative w-64 h-90  rounded-2xl  ">
              {/* Shine effect */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
              />
              {/* Content on top when hover*/}
              <div className={`absolute inset-0 p-4 rounded-2xl bg-gray-900/85 transition-opacity duration-300 opacity-0 text-white ${isHovered ? "opacity-100" : ""} `}>
                <h3 className="text-3xl font-bold my-3 ">{card.title}</h3>
                <p className="opacity-85 text-lg">{card.content}</p>
              </div>

              <Image src={card.url} width={256} height={360} alt={card.title}
                className="border-1 rounded-[0.75rem] w-64 h-90 shadow-[-4px_4px_25px_1px]"/>

            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CardStack
