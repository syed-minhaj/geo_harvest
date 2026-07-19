"use client"

import { Pie, PieChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/app/components/ui/chart"

export function CropDistribution({ data }: { data: { name: string; count: number; fill: string }[] }) {
    const chartConfig = data.reduce((acc, item, i) => ({
        ...acc,
        [item.name]: { label: item.name, color: item.fill },
    }), {} as ChartConfig)

    return (
        <div className="w-full space-y-4 bg-bg2 p-4 rounded-r1 border border-input">
            <p className="font-medium">Crop Distribution</p>
            <ChartContainer config={chartConfig} className="w-full h-fit">
                <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Pie data={data} dataKey="count" nameKey="name" innerRadius={60} strokeWidth={2} />
                </PieChart>
            </ChartContainer>
        </div>
    )
}
