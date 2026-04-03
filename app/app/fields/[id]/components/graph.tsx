"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/app/components/ui/chart"
import { TrendingDown, TrendingUp } from "lucide-react"
import {AreaChart, CartesianGrid, XAxis, Area , YAxis } from "recharts"
import { tfield , tcrop, ImageType} from "@/app/types";
import {useHash } from "@/app/hooks/hash";
import { useEffect,useState } from "react";
import { getDateShort } from "@/app/utils/Date";
import {ChangeGraphType,  ChangeGraphYear } from "./chageGraphSettting";
import { allData } from "./Main";

type graphType = "yearly" | "periodly"

type avgPixelValue = {
    fieldId : string,
    imageType : ImageType,
    imageDate : string,
    value : number | null,
}


const chartDataByYear = (rawData: { date: string; value: number }[] , year : number) => {
    
    const sorted = [...rawData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const lastYear = sorted.filter(
        d => new Date(d.date).getFullYear() === year - 1
    )
    const nextYear = sorted.filter(
        d => new Date(d.date).getFullYear() === year + 1
    )
    const filtered = sorted.filter(
        d => new Date(d.date).getFullYear() === year
    )

    if (filtered.length === 0) return []

    const firstDate = new Date(sorted[0].date)
    const lastDate  = new Date(sorted[sorted.length - 1].date)

    const months = ["jan 1", "feb 1", "mar 1", "apr 1", "may 1", "jun 1", "jul 1", "aug 1", "sep 1", "oct 1", "nov 1", "dec 1"]
    
    const leading = []
    const jan1 = new Date(firstDate.getFullYear(), 0, 1)
    if ((firstDate.getMonth() != jan1.getMonth()) && !lastYear.length) {
        for (let i = 0; i < firstDate.getMonth(); i++) {
            leading.push({ date: months[i], value: NaN })
        }
    }
    const trailing = []
    const dec31 = new Date(firstDate.getFullYear(), 11, 31)
    if ((lastDate.getMonth() != dec31.getMonth()) && !nextYear.length) {
        for (let i = lastDate.getMonth() + 1; i < 12; i++) {
            trailing.push({ date: months[i], value: NaN })
        }
    }

    return [
        ...leading,
        ...filtered.map(d => ({
            date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: d.value,
        })),
        ...trailing,
    ]
}


const Graph = ({typeP , field , allData} : {typeP : graphType , field : tfield , allData : allData}) => {
    const {hash} = useHash("")
    const [type , setType] = useState<"yearly" | "periodly">(typeP)
    const [year , setYear] = useState(new Date().getFullYear())
    const [chartData , setChartData] = useState < {date : string , value : number}[]>([])
    const [done , setDone] = useState(false)
    const [value , setValue] = useState<{label:string,color:string}>({
        label: "value",
        color: "#0ADD08",
    });


    useEffect(() => {
        if (document && hash){
            const data = allData[hash as ImageType][type];
            if (data) {
                if (type === "yearly") {
                    setChartData(chartDataByYear(data.data , year));
                } else {
                    setChartData(data.data);
                }
                setValue(data.value);
                setDone(true);
            }else{
                setDone(false)
                setChartData([])
                setValue({label : "value" , color : "#0ADD08"})
            }
        }
    },[hash , type , allData , year ])

    const chartConfig = {
        value: value,
    } satisfies ChartConfig
    
    function scoreToCompliment(score : number) {
        switch(score) {
            case 0.25 : return "very poor"
            case 0.50 : return "poor"
            case 0.75 : return "average"
            case 1.00 : return "good"
            default : return ""
        }
    }

    function CustomTick({ x, y, stroke, payload }: any) {
        return (
            <g transform={`translate(${x},${y})`} >
                <text
                    fill="var(--sidebar-ring)" 
                    dy={16}
                    textAnchor="end"
                    fontSize={10}
                    transform="rotate(-45) translate(-5)"
                >
                    {scoreToCompliment(payload.value).includes(" ") ?
                        scoreToCompliment(payload.value).split(" ").map((word , index) => <tspan key={index} x={0} dy="1.2em" >{word}</tspan>)
                    :
                        scoreToCompliment(payload.value)
                    }
                </text>
            </g>
        );
    }

    return (
        <Card className={`${!done ? "animate-pulse" : ""} relative corner-squircle`}>
            <div className={`absolute w-full h-full flex justify-center items-center  ${!done ? "": "hidden"}`}>
                <div className="">loading...</div>
            </div>
            <CardHeader>
                <CardTitle className="w-full flex flex-row">{hash} graph over time {type}
                    <div className="flex flex-row gap-2 ml-auto">
                        {type === "yearly" && 
                            <ChangeGraphYear year={year} setYear={setYear} years={[2025,2026]} />
                        }
                        <ChangeGraphType type={type} setType={setType} />
                    </div>
                </CardTitle>
                <CardDescription>
                    Showing total visitors for the last 6 months
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
                <ChartContainer config={chartConfig} className="aspect-56/31">
                <AreaChart
                    accessibilityLayer
                    key={`${value.color}-${hash}-${type}`}
                    data={chartData}
                    margin={{
                        left: 0,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} opacity={0.4} stroke="var(--border)"/>
                    <XAxis
                        type="category" 
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value}
                    />
                    <YAxis 
                        dataKey="value"
                        tickLine={false}
                        axisLine={false}
                        width={30}
                        ticks={[0, 0.25, 0.50, 0.75, 1.0]}
                        domain={[0, 1]}
                        tickFormatter={(value) => `${scoreToCompliment(value)}`}
                        tick={CustomTick}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <defs>
                    <linearGradient id={`fillValue-${value.color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={value.color}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor={value.color}
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    </defs>
                    <Area
                        dataKey="value"
                        type="linear"
                        fill={`url(#fillValue-${value.color})`}
                        fillOpacity={0.4}
                        stroke="var(--color-value)"
                        stackId="a"
                        dot={true}
                    />
                </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                    <div className="flex items-center gap-2 leading-none font-medium">
                        {(() => {
                            if (!done) return "Loading...";
                            if(!chartData[chartData.length - 2]) return "No Change"
                            const diff =  chartData[chartData.length - 1].value - chartData[chartData.length - 2].value 
                            const diffInPercent = (Math.abs(diff) / chartData[chartData.length - 2].value * 100).toFixed(2)
                            if (diff > 0) 
                                return (
                                    <>{"Trending up by"} {diffInPercent} {"% "} <TrendingUp className="h-4 w-4" /></>
                                )
                            else if (diff < 0) {
                                return (
                                    <>{"Trending down by"} {diffInPercent} {"% "} <TrendingDown className="h-4 w-4" /></>
                                )
                            }
                            else return "No change" 
                        })()} 
                        {/* Trending up by 5.2% this month <TrendingUp className="h-4 w-4" /> */}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 leading-none">
                        {getDateShort(new Date(field.imagesDates[field.imagesDates.length - 1]))} - {getDateShort(new Date(field.imagesDates[0]))}
                    </div>
                </div>
                </div>
            </CardFooter>
        </Card>
    )
}

export default Graph