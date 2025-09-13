import Image from "next/image";
import { cva } from "class-variance-authority";

type tCard = {
    id: number,
    title: string,
    content: string,
    position: string,
    url: string
}

const cardStyles = cva([
    "w-4/6",
    "md:w-full",
    "place-items-center",
    "hidden",
    "md:grid",
    "md:grid-cols-4",
]);

const cardRotateStyles = cva([
    "cursor-pointer",
    "transition-all",
    "duration-500",
    "ease-out",
    "shadow-2xl",
    "relative",
    "group",
    "hover:z-50",
    "hover:scale-105",
    "[transform:perspective(1000px)_rotateY(20deg)]",
    "hover:[transform:perspective(1000px)_rotateY(0deg)]",
]);


const CardStack = ({ cards } : { cards: tCard[] }) => {

    return (
        <div
            className={cardStyles()}
        >
            {cards.map((card) => {

                return (
                    <div
                        key={card.id}
                        className={cardRotateStyles()}

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
                                className="hover:opacity-100 opacity-0 absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent transition-opacity duration-300 pointer-events-none"

                            />

                            {/* Content overlay */}
                            <div
                                className="absolute inset-0 p-4 rounded-2xl text-white group-hover:flex flex-col justify-start transition-opacity duration-300
                                            hover:opacity-100 opacity-0 hidden "
                                style={{
                                    backgroundColor: 'rgba(17, 24, 39, 0.85)',
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