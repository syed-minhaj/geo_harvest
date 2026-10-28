import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";
import { CheckIcon, ChevronDownIcon, TrendingDown } from "lucide-react";

/* SelectTrigger base copied verbatim from ui/select.tsx line 40, merged with cn() exactly like the real component */
const PARAM_TRIGGER_BASE = "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground dark:bg-input/30 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs h-9 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

/* SelectContent / SelectLabel / SelectItem bases copied verbatim from ui/select.tsx */
const PARAM_CONTENT_BASE = "bg-popover text-popover-foreground relative z-50 min-w-[8rem] overflow-x-hidden rounded-md border shadow-md";
const PARAM_LABEL_BASE = "text-muted-foreground px-2 py-1.5 text-xs";
const PARAM_ITEM_BASE = "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

function MockSelectTrigger({ value, className, multiline }: { value: string; className?: string; multiline?: boolean }) {
    return (
        <div
            data-slot="select-trigger"
            data-size="default"
            className={cn(PARAM_TRIGGER_BASE, className, multiline ? "h-auto whitespace-normal py-1.5" : "")}
            aria-hidden
        >
            <span data-slot="select-value" className={cn("flex items-center gap-2", multiline ? "line-clamp-none whitespace-normal text-left" : "line-clamp-1")}>{value}</span>
            <ChevronDownIcon className="size-4 opacity-50" />
        </div>
    );
}

function MockSelectContent({
    label,
    items,
    activeIndex = -1,
    className,
}: {
    label: string;
    items: string[];
    activeIndex?: number;
    className?: string;
}) {
    return (
        <div
            data-slot="select-content"
            className={cn(PARAM_CONTENT_BASE, className)}
            aria-hidden
        >
            <div data-slot="select-label" className={PARAM_LABEL_BASE}>{label}</div>
            {items.map((item, i) => (
                <div
                    key={item}
                    data-slot="select-item"
                    className={cn(PARAM_ITEM_BASE, i === activeIndex ? "bg-accent text-accent-foreground" : "")}
                >
                    {item}
                    <span className="absolute right-2 flex size-3.5 items-center justify-center">
                        {i === activeIndex ? <CheckIcon className="size-4" /> : null}
                    </span>
                </div>
            ))}
        </div>
    );
}

const steps = [
    {
        n: "01",
        title: "Draw your field boundary",
        copy: "Drag a polygon on the map, the way you would in any drawing tool. Your boundaries persist — analysis runs against them every satellite pass.",
        mock: (
            <div className="rounded-lg border border-[#EAEAEA] dark:border-[#242D27] bg-white dark:bg-[#121714] overflow-hidden">
                <div className="relative aspect-[16/10] bg-[#FCFCFB] dark:bg-[#101511]">
                    <div className="survey-grid absolute inset-0 opacity-70" aria-hidden />
                    <svg viewBox="0 0 200 122" className="w-full h-full" aria-hidden>
                        <polygon
                            points="46,28 150,26 168,84 88,102 38,78"
                            fill="rgba(52,101,56,0.10)"
                            stroke="#346538"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                        />
                        <circle cx="46" cy="28" r="3" fill="#346538" />
                        <circle cx="168" cy="84" r="3" fill="#346538" />
                        <circle cx="88" cy="102" r="3" fill="#346538" />
                        <circle cx="38" cy="78" r="3" fill="#346538" />
                        <g stroke="#346538" strokeWidth="1.25">
                            <line x1="140" y1="26" x2="160" y2="26" />
                            <line x1="150" y1="16" x2="150" y2="36" />
                        </g>
                        <circle cx="150" cy="26" r="4.5" fill="#346538" stroke="#fff" strokeWidth="1.5" />
                    </svg>
                    <span className="absolute top-2 right-2 font-mono text-[9px] uppercase tracking-[0.12em] text-white/70 bg-black/40 px-1.5 py-0.5 rounded">
                        edit · drag to place
                    </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 border-t border-[#EAEAEA] dark:border-[#242D27]">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft dark:text-[#96A29A]">
                        draw · polygon
                    </span>
                    <span className="w-3.5 h-3.5 rounded-[4px] bg-green-ink border border-green-ink flex items-center justify-center">
                        <svg viewBox="0 0 10 10" className="w-2 h-2 text-white" aria-hidden>
                            <path d="M1.5 5.5 4 8l4.5-6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                        </svg>
                    </span>
                </div>
            </div>
        ),
    },
    {
        n: "02",
        title: "Pick your crop",
        copy: "The same crop select you get on the create-field page — wheat, rice, cotton. Varieties and planting dates tune the analysis thresholds.",
        mock: (
            /* layout + svg-free copy of fields/create/page.tsx, wrapper mimics the page's main p-4 */
            <div className="rounded-xl border border-[#EAEAEA] dark:border-[#242D27] bg-background overflow-hidden pointer-events-none select-none">
                <div className="relative flex flex-col gap-4 p-4 w-full text-card-foreground">
                    {/* name row — create page lines 94-99 */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <h3 className="text-xl font-bold font-josefin-sans w-fit">Name of field : </h3>
                        <div className="flex flex-col gap-1 w-full sm:w-[20rem]">
                            <Input type="text" readOnly value="North quarter" className="w-full" />
                        </div>
                    </div>
                    <div data-slot="separator" className="bg-border shrink-0 h-px w-full" />
                    {/* crops section — create page lines 102-155, dropdown rendered open */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold font-josefin-sans">Crops </h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <MockSelectTrigger value="wheat" className="w-full" />
                                <MockSelectContent
                                    label="Crop"
                                    items={["wheat", "rice", "cotton"]}
                                    activeIndex={0}
                                    className="w-full mt-1"
                                />
                            </div>
                            <div>
                                <MockSelectTrigger value="common wheat (Triticum aestivum)" className="w-full" multiline />
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <h4 className="font-medium font-josefin-sans">Planted date : </h4>
                                <Input type="date" readOnly value="2025-07-01" className="flex-1 max-w-1/2" />
                            </div>
                        </div>
                        <Button className="sm:w-fit pointer-events-none select-none">Create</Button>
                    </div>
                </div>
            </div>
        ),
    },
    {
        n: "03",
        title: "Read the satellite pass",
        copy: "Every pass lands as one of the four index maps plus a chart on the field page — switch yearly or crop-cycle to see how water requirement has moved since planting.",
        mock: (
            /* structure + classes copied from fields/[id]/components/graph.tsx */
            <Card className="relative corner-squircle bg-background">
                <CardHeader className="flex flex-row max-sm:flex-wrap gap-y-1">
                    <div className="flex flex-col gap-1.5">
                        <CardTitle className="w-full flex flex-row">Water requirement graph over time yearly</CardTitle>
                        <CardDescription>12 Jun&apos;24 - 18 Oct&apos;25</CardDescription>
                    </div>
                    <div className="flex flex-row gap-2 ml-auto">
                        <MockSelectTrigger value="2025" />
                        <MockSelectTrigger value="yearly" />
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <div className="aspect-[56/31] w-full relative">
                        <svg viewBox="0 0 360 200" className="w-full h-full" aria-hidden>
                            <defs>
                                <linearGradient id="mockFillValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity="0.8" />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity="0.1" />
                                </linearGradient>
                            </defs>
                            {/* CartesianGrid vertical={false} opacity=0.4 */}
                            <g stroke="var(--border)" opacity="0.4">
                                <line x1="44" y1="150" x2="348" y2="150" />
                                <line x1="44" y1="112" x2="348" y2="112" />
                                <line x1="44" y1="74" x2="348" y2="74" />
                                <line x1="44" y1="36" x2="348" y2="36" />
                            </g>
                            {/* YAxis tick labels — CustomTick rotated -45 */}
                            <g fill="var(--sidebar-ring)" fontSize="10">
                                <text x="40" y="154" textAnchor="end" transform="rotate(-45 40 154)">very poor</text>
                                <text x="40" y="116" textAnchor="end" transform="rotate(-45 40 116)">poor</text>
                                <text x="40" y="78" textAnchor="end" transform="rotate(-45 40 78)">average</text>
                                <text x="40" y="40" textAnchor="end" transform="rotate(-45 40 40)">good</text>
                            </g>
                            {/* Area fill fillOpacity 0.4 + dots */}
                            <path
                                d="M52 132 L86 118 L120 96 L154 108 L188 66 L222 76 L256 48 L290 66 L324 40 L348 50 L348 150 L52 150 Z"
                                fill="url(#mockFillValue)"
                                stroke="none"
                            />
                            <path
                                d="M52 132 L86 118 L120 96 L154 108 L188 66 L222 76 L256 48 L290 66 L324 40 L348 50"
                                fill="none"
                                stroke="var(--chart-1)"
                                strokeWidth="1.75"
                            />
                            <g fill="var(--chart-1)">
                                <circle cx="52" cy="132" r="3" />
                                <circle cx="86" cy="118" r="3" />
                                <circle cx="120" cy="96" r="3" />
                                <circle cx="154" cy="108" r="3" />
                                <circle cx="188" cy="66" r="3" />
                                <circle cx="222" cy="76" r="3" />
                                <circle cx="256" cy="48" r="3" />
                                <circle cx="290" cy="66" r="3" />
                                <circle cx="324" cy="40" r="3" />
                                <circle cx="348" cy="50" r="3" />
                            </g>
                            {/* XAxis date ticks */}
                            <g fill="var(--sidebar-ring)" fontSize="10" textAnchor="middle">
                                <text x="52" y="176">Feb 23</text>
                                <text x="120" y="176">May 15</text>
                                <text x="188" y="176">Jul 6</text>
                                <text x="256" y="176">Sep 2</text>
                                <text x="324" y="176">Oct 18</text>
                            </g>
                        </svg>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2 leading-none font-medium">
                                Trending down by 9.62 % <TrendingDown className="h-4 w-4" />
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                12 Jun&apos;24 - 18 Oct&apos;25
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        ),
    },
] as const;

export function Storyboard() {
    return (
        <ol className="divide-y divide-[#EAEAEA] dark:divide-[#242D27]">
            {steps.map((s) => (
                <li
                    key={s.n}
                    className="grid grid-cols-1 lg:grid-cols-[56px_1fr] xl:grid-cols-[56px_1fr_minmax(340px,460px)] gap-5 xl:gap-10 items-center py-10 first:pt-0 last:pb-0"
                >
                    <span className="font-mono text-2xl text-[#D6D5D0] dark:text-[#333F37] leading-none pt-1">{s.n}</span>
                    <div className="max-w-xl">
                        <h3 className="font-display text-3xl leading-tight tracking-[-0.02em] text-ink dark:text-[#E7EDE8] mb-3">
                            {s.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-ink-soft dark:text-[#96A29A]">{s.copy}</p>
                    </div>
                    <div className="reveal lg:col-span-2 xl:col-span-1">{s.mock}</div>
                </li>
            ))}
        </ol>
    );
}
