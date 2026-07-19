"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/app/components/ui/chart"

function valueToColor(v: number): string {
    if (v <= 0) return "#ff0000"
    if (v >= 1) return "#00cc00"
    const r = v < 0.5 ? 255 : Math.round((1 - (v - 0.5) / 0.5) * 200)
    const g = v < 0.5 ? Math.round((v / 0.5) * 200) : 200
    return `rgb(${r}, ${g}, 40)`
}

const chartConfig = {
    water: { label: "Water" },
    nitrogen: { label: "Nitrogen" },
    phosphorus: { label: "Phosphorus" },
    stress: { label: "Crop Stress" },
} satisfies ChartConfig

export function FieldComparison({ data }: { data: { field: string; water: number; nitrogen: number; phosphorus: number; stress: number }[] }) {
    const metrics = ["water", "nitrogen", "phosphorus", "stress"] as const

    return (
        <div className="w-full space-y-4 bg-bg2 p-4 rounded-r1 border border-input">
            <p className="font-medium">Latest Values by Field</p>
            <ChartContainer config={chartConfig} className="w-full h-fit">
                <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="field" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    {metrics.map((metric) => (
                        <Bar key={metric} dataKey={metric} radius={4}>
                            {data.map((entry, index) => (
                                <Cell key={`${metric}-${index}`} fill={valueToColor(entry[metric])} />
                            ))}
                        </Bar>
                    ))}
                </BarChart>
            </ChartContainer>
        </div>
    )
}
