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

    const containerStyle: React.CSSProperties = {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        placeItems: 'center',
        gap: '1rem'
    }

    return (
        <div style={containerStyle}>
            {cards.map((card) => {
                const isHovered = hoveredCard === card.id
                
                const cardStyle: React.CSSProperties = {
                    cursor: 'pointer',
                    transition: 'all 0.5s ease-out',
                    position: 'relative',
                    transform: `perspective(1000px) rotateX(0deg) rotateY(${isHovered ? 0 : 20}deg) scale(${isHovered ? 1.05 : 1})`,
                    zIndex: isHovered ? 50 : 1,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }

                const cardContainerStyle: React.CSSProperties = {
                    position: 'relative',
                    width: '256px',
                    height: '384px',
                    borderRadius: '1rem',
                    overflow: 'hidden'
                }

                const shineStyle: React.CSSProperties = {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '1rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s',
                    pointerEvents: 'none'
                }

                const overlayStyle: React.CSSProperties = {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '1rem',
                    borderRadius: '1rem',
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    opacity: isHovered ? 1 : 0,
                    visibility: isHovered ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s, visibility 0.3s'
                }

                const titleStyle: React.CSSProperties = {
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '0.75rem',
                    lineHeight: '1.2'
                }

                const contentStyle: React.CSSProperties = {
                    fontSize: '1rem',
                    opacity: 0.9,
                    lineHeight: '1.5'
                }

                const imageStyle: React.CSSProperties = {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' as const,
                    borderRadius: '1rem'
                }
                
                return (
                    <div
                        key={card.id}
                        style={cardStyle}
                        onMouseEnter={() => handleMouseEnter(card.id)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div style={cardContainerStyle}>
                            <Image 
                                src={card.url} 
                                width={256} 
                                height={384} 
                                alt={card.title}
                                style={imageStyle}
                            />
                            
                            <div style={shineStyle} />
                            
                            <div style={overlayStyle}>
                                <h3 style={titleStyle}>{card.title}</h3>
                                <p style={contentStyle}>{card.content}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default CardStack
