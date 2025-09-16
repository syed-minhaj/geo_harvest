import Image from "next/image";

type tCard = {
    id : number,
    title : string,
    content : string,
    position : string,
    url : string
}

const flexdirection = (id : number) => {
    return id % 2 === 0 ? "flex-row" : "flex-row-reverse"
}
const FeatureImage = ({cards} : {cards : tCard[]}) => {
    return (
        <div className="w-ful flex md:hidden flex-col items-center gap-4 ">
            {cards.map((card) => {
                return (
                    <div key={card.id} className={`flex ${flexdirection(card.id)} justify-between gap-2 w-full`}>
                        <Image src={card.url} width={128} height={180} alt={card.title}
                        className={`border-1 rounded-[0.75rem]   shadow-[-4px_4px_25px_1px]  `}/>
                        <div className={`flex flex-col w-full  `}>
                            <h3 className="text-xl font-semibold my-3 ">{card.title}</h3>
                            <p className="opacity-85 text-sm">{card.content}</p>
                        </div>
                    </div>

                )
            })}
        </div>
    )
}

export default FeatureImage