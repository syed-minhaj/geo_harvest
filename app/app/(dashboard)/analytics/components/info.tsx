export function Info({heading, value}: {heading: string, value: string}) {
    return (
        <div className="flex flex-col gap-2 bg-bg2 rounded-r1 border border-input w-full p-4">
            <p className="font-medium opacity-66">{heading}</p>
            <p className="font-medium text-2xl">{value}</p>
        </div>
    )
}
