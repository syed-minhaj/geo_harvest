"use client"

import { CartesianGrid, XAxis, AreaChart, Area } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/app/components/ui/chart"

const chartConfig = {
    water: { label: "Water", color: "#2563eb" },
    nitrogen: { label: "Nitrogen", color: "#16a34a" },
    phosphorus: { label: "Phosphorus", color: "#d97706" },
    stress: { label: "Crop Stress", color: "#dc2626" },
} satisfies ChartConfig

export function OverviewChart({ data }: { data: { date: string; water: number; nitrogen: number; phosphorus: number; stress: number }[] }) {
    return (
        <div className="w-full space-y-4 bg-bg2 p-4 rounded-r1 border border-input">
            <p className="font-medium">Vegetation Indices Over Time</p>
            <ChartContainer config={chartConfig} className="w-full h-fit">
                <AreaChart accessibilityLayer data={data} margin={{ top: 20, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <defs>
                        {(["water", "nitrogen", "phosphorus", "stress"] as const).map((key) => (
                            <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig[key].color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={chartConfig[key].color} stopOpacity={0.05} />
                            </linearGradient>
                        ))}
                    </defs>
                    {(["water", "nitrogen", "phosphorus", "stress"] as const).map((key) => (
                        <Area
                            key={key}
                            dataKey={key}
                            type="natural"
                            fill={`url(#fill-${key})`}
                            fillOpacity={0.4}
                            stroke={chartConfig[key].color}
                            dot={false}
                        />
                    ))}
                </AreaChart>
            </ChartContainer>
        </div>
    )
}
