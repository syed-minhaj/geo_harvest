export default function AnalyticsSkeleton() {
    return (
        <div className="flex flex-col gap-4 mb-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="w-full bg-bg2 rounded-r1 border border-input h-24.5 p-4" />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full bg-bg2 rounded-r1 border border-input h-72 p-4" />
                <div className="w-full bg-bg2 rounded-r1 border border-input h-72 p-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full bg-bg2 rounded-r1 border border-input h-72 p-4" />
                <div className="w-full bg-bg2 rounded-r1 border border-input h-72 p-4" />
            </div>
        </div>
    )
}
