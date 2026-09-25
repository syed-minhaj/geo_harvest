"use client"

type FreshnessRow = {
    name: string
    latestDate: string
    daysSince: number
    status: "Recent" | "Normal" | "Stale"
}

const statusColor = {
    Recent: "text-[#2F7B4F] dark:text-[#5FAD7B]",
    Normal: "text-[#A97A22] dark:text-[#E0A24E]",
    Stale: "text-[#C5574E] dark:text-[#D87169]",
}

export function DataFreshnessTable({ data }: { data: FreshnessRow[] }) {
    return (
        <div className="w-full space-y-4 bg-bg2 p-4 rounded-r1 border border-input">
            <p className="font-medium">Data Freshness</p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-input">
                            <th className="text-left font-medium opacity-66 pb-2 pr-4">Field</th>
                            <th className="text-left font-medium opacity-66 pb-2 pr-4">Latest Data</th>
                            <th className="text-left font-medium opacity-66 pb-2 pr-4">Days Ago</th>
                            <th className="text-left font-medium opacity-66 pb-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.name} className="border-b border-input/50 last:border-0">
                                <td className="py-2 pr-4 font-medium">{row.name}</td>
                                <td className="py-2 pr-4">{row.latestDate}</td>
                                <td className="py-2 pr-4">{row.daysSince}</td>
                                <td className={`py-2 font-medium ${statusColor[row.status]}`}>{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
