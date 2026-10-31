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

/* ——— Graph mock pieces (step 03) ——— */

const YTICKS = [
    { v: "very poor", y: "97.4%" },
    { v: "poor", y: "65.8%" },
    { v: "average", y: "34.2%" },
    { v: "good", y: "2.63%" },
];

function MockTicks({ xs }: { xs: { v: string; x: string }[] }) {
    return (
        <div aria-hidden>
            {YTICKS.map((t) => (
                <span
                    key={t.v}
                    className="absolute whitespace-nowrap text-[10px] leading-none text-muted-foreground dark:text-[#E7EDE8] [transform:translate(-50%,-50%)_rotate(-45deg)]"
                    style={{ left: "-31px", top: t.y }}
                >
                    {t.v}
                </span>
            ))}
            {xs.map((t) => (
                <span
                    key={t.v}
                    className="absolute whitespace-nowrap text-[10px] leading-none -translate-x-1/2 text-muted-foreground dark:text-[#E7EDE8]"
                    style={{ left: t.x, top: "calc(100% + 6px)" }}
                >
                    {t.v}
                </span>
            ))}
        </div>
    );
}

type MockPoint = [number, number];

/* PTS_Y2025 ends where PTS_Y2026 starts — year switch reads as one continuous season */
const PTS_Y2025: MockPoint[] = [[6, 83], [70, 67], [133, 47], [196, 37], [259, 73], [314, 79]];
const PTS_Y2026: MockPoint[] = [[6, 80], [37, 72], [73, 62], [110, 49], [147, 35], [184, 14], [220, 12], [257, 22], [294, 42], [314, 52]];
const PTS_CYCLE: MockPoint[] = [[6, 98], [104, 59], [202, 30], [300, 36]];

const XS_Y2025 = [
    { v: "Feb 18", x: "1.88%" },
    { v: "Jun 27", x: "41.6%" },
    { v: "Oct 24", x: "80.9%" },
];
const XS_Y2026 = [
    { v: "Feb 23", x: "1.88%" },
    { v: "May 15", x: "22.8%" },
    { v: "Jul 6", x: "45.94%" },
    { v: "Sep 2", x: "68.95%" },
    { v: "Oct 18", x: "91.89%" },
];
const XS_CYCLE = [
    { v: "sowing", x: "1.88%" },
    { v: "tillering", x: "32.5%" },
    { v: "heading", x: "63.1%" },
    { v: "maturity", x: "93.75%" },
];

function MockChart({ pts, gradId, xs }: { pts: MockPoint[]; gradId: string; xs: { v: string; x: string }[] }) {
    const line = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1]).join(" ");
    const x0 = pts[0][0];
    const x1 = pts[pts.length - 1][0];
    return (
        <div className="aspect-[56/31] w-full relative overflow-hidden">
            <div className="absolute left-[62px] right-[8px] top-[30px] bottom-[34px]">
                <svg viewBox="0 0 320 152" preserveAspectRatio="none" className="w-full h-full" aria-hidden>
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity="0.8" />
                            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                    {/* CartesianGrid vertical={false} opacity=0.4 */}
                    <g stroke="var(--border)" opacity="0.4" vectorEffect="non-scaling-stroke">
                        <line x1="0" y1="4" x2="320" y2="4" />
                        <line x1="0" y1="52" x2="320" y2="52" />
                        <line x1="0" y1="100" x2="320" y2="100" />
                        <line x1="0" y1="148" x2="320" y2="148" />
                    </g>
                    {/* Area fill fillOpacity 0.4 + dots */}
                    <path d={`${line} L${x1} 148 L${x0} 148 Z`} fill={`url(#${gradId})`} stroke="none" />
                    <path
                        d={line}
                        fill="none"
                        stroke="var(--chart-1)"
                        strokeWidth="1.75"
                        vectorEffect="non-scaling-stroke"
                        strokeLinejoin="round"
                    />
                    <g fill="var(--chart-1)">
                        {pts.map((p) => (
                            <circle key={`${p[0]}-${p[1]}`} cx={p[0]} cy={p[1]} r="2.25" />
                        ))}
                    </g>
                </svg>
                <MockTicks xs={xs} />
            </div>
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
            /* structure + classes copied from fields/[id]/components/graph.tsx + chageGraphSettting.tsx */
            /* dropdowns are a static CSS-only state machine — no client JS, page stays static */
            <Card id="mgGraph" className="relative corner-squircle bg-graph-bg">
                <input type="radio" name="mgYear" id="mgY2026" className="hidden" defaultChecked />
                <input type="radio" name="mgYear" id="mgY2025" className="hidden" />
                <input type="radio" name="mgType" id="mgTYear" className="hidden" defaultChecked />
                <input type="radio" name="mgType" id="mgTCycle" className="hidden" />
                <input type="checkbox" id="mgOpenY" className="hidden" />
                <input type="checkbox" id="mgOpenT" className="hidden" />
                <style>{`
#mgGraph .mg-vy-2025,#mgGraph .mg-vy-2026,#mgGraph .mg-vt-cycle,#mgGraph .mg-t-c,#mgGraph .mg-d-c{display:none}
#mgGraph:has(#mgY2026:checked) .mg-vy-2025,#mgGraph:has(#mgTCycle:checked) .mg-vt-year{display:none}
#mgGraph:has(#mgY2025:checked) .mg-vy-2025,#mgGraph:has(#mgY2026:checked) .mg-vy-2026,#mgGraph:has(#mgTCycle:checked) .mg-vt-cycle{display:inline-block}
#mgGraph:has(#mgTCycle:checked) .mg-t-y,#mgGraph:has(#mgTCycle:checked) .mg-d-y{display:none}
#mgGraph:has(#mgTCycle:checked) .mg-t-c,#mgGraph:has(#mgTCycle:checked) .mg-d-c{display:inline-block}
#mgGraph:has(#mgTCycle:checked) .mg-ywrap,#mgGraph:has(#mgTCycle:checked) .mg-close-y{display:none}
#mgGraph .mg-menu,#mgGraph .mg-close,#mgGraph .mg-chart,#mgGraph .mg-f,#mgGraph .mg-ck{display:none}
#mgGraph:has(#mgOpenY:checked) .mg-menu-y,#mgGraph:has(#mgOpenY:checked) .mg-close-y{display:block}
#mgGraph:has(#mgOpenT:checked) .mg-menu-t,#mgGraph:has(#mgOpenT:checked) .mg-close-t{display:block}
#mgGraph:has(#mgTYear:checked):has(#mgY2026:checked) .mg-chart-y2026,#mgGraph:has(#mgTYear:checked):has(#mgY2025:checked) .mg-chart-y2025,#mgGraph:has(#mgTCycle:checked) .mg-chart-cycle{display:block}
#mgGraph:has(#mgTYear:checked):has(#mgY2026:checked) .mg-f-y2026,#mgGraph:has(#mgTYear:checked):has(#mgY2025:checked) .mg-f-y2025,#mgGraph:has(#mgTCycle:checked) .mg-f-cycle{display:flex}
#mgGraph:has(#mgY2026:checked) .mg-it-2026,#mgGraph:has(#mgY2025:checked) .mg-it-2025,#mgGraph:has(#mgTYear:checked) .mg-it-tyear,#mgGraph:has(#mgTCycle:checked) .mg-it-tcycle{background-color:var(--accent);color:var(--accent-foreground)}
#mgGraph:has(#mgY2026:checked) .mg-ck-2026,#mgGraph:has(#mgY2025:checked) .mg-ck-2025,#mgGraph:has(#mgTYear:checked) .mg-ck-tyear,#mgGraph:has(#mgTCycle:checked) .mg-ck-tcycle{display:flex}
`}</style>
                <label htmlFor="mgOpenY" className="mg-close mg-close-y absolute inset-0 z-40 cursor-default" aria-hidden />
                <label htmlFor="mgOpenT" className="mg-close mg-close-t absolute inset-0 z-40 cursor-default" aria-hidden />
                <CardHeader className="flex flex-row max-sm:flex-wrap gap-y-1">
                    <div className="flex flex-col gap-1.5">
                        <CardTitle className="w-full flex flex-row">
                            <span>
                                Water requirement graph over
                                <span className="mg-t-y"> time yearly</span>
                                <span className="mg-t-c"> crop cycle</span>
                            </span>
                        </CardTitle>
                        <CardDescription>
                            <span className="mg-d-y">12 Jun&apos;25 - 18 Oct&apos;26</span>
                            <span className="mg-d-c">Average score per growth stage</span>
                        </CardDescription>
                    </div>
                    <div className="flex flex-row gap-2 ml-auto">
                        <div className="relative mg-ywrap">
                            <label
                                htmlFor="mgOpenY"
                                data-slot="select-trigger"
                                data-size="default"
                                className={cn(PARAM_TRIGGER_BASE, "cursor-pointer mg-trig")}
                            >
                                <span data-slot="select-value" className={cn("flex items-center gap-2", "line-clamp-1")}>
                                    <span className="mg-vy-2026">2026</span>
                                    <span className="mg-vy-2025">2025</span>
                                </span>
                                <ChevronDownIcon className="size-4 opacity-50" />
                            </label>
                            <div
                                data-slot="select-content"
                                className={cn(PARAM_CONTENT_BASE, "mg-menu mg-menu-y absolute right-0 top-full mt-1 min-w-[8rem]")}
                            >
                                <div data-slot="select-label" className={PARAM_LABEL_BASE}>Year</div>
                                <label htmlFor="mgY2026" className={cn(PARAM_ITEM_BASE, "mg-it-2026 cursor-pointer")}>
                                    2026
                                    <span className="mg-ck mg-ck-2026 absolute right-2 flex size-3.5 items-center justify-center">
                                        <CheckIcon className="size-4" />
                                    </span>
                                </label>
                                <label htmlFor="mgY2025" className={cn(PARAM_ITEM_BASE, "mg-it-2025 cursor-pointer")}>
                                    2025
                                    <span className="mg-ck mg-ck-2025 absolute right-2 flex size-3.5 items-center justify-center">
                                        <CheckIcon className="size-4" />
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="relative">
                            <label
                                htmlFor="mgOpenT"
                                data-slot="select-trigger"
                                data-size="default"
                                className={cn(PARAM_TRIGGER_BASE, "cursor-pointer mg-trig")}
                            >
                                <span data-slot="select-value" className={cn("flex items-center gap-2", "line-clamp-1")}>
                                    <span className="mg-vt-year">yearly</span>
                                    <span className="mg-vt-cycle">crop cycle</span>
                                </span>
                                <ChevronDownIcon className="size-4 opacity-50" />
                            </label>
                            <div
                                data-slot="select-content"
                                className={cn(PARAM_CONTENT_BASE, "mg-menu mg-menu-t absolute right-0 top-full mt-1 min-w-[8rem]")}
                            >
                                <div data-slot="select-label" className={PARAM_LABEL_BASE}>Time period</div>
                                <label htmlFor="mgTYear" className={cn(PARAM_ITEM_BASE, "mg-it-tyear cursor-pointer")}>
                                    Yearly
                                    <span className="mg-ck mg-ck-tyear absolute right-2 flex size-3.5 items-center justify-center">
                                        <CheckIcon className="size-4" />
                                    </span>
                                </label>
                                <label htmlFor="mgTCycle" className={cn(PARAM_ITEM_BASE, "mg-it-tcycle cursor-pointer")}>
                                    Crop Cycle
                                    <span className="mg-ck mg-ck-tcycle absolute right-2 flex size-3.5 items-center justify-center">
                                        <CheckIcon className="size-4" />
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <div className="mg-chart mg-chart-y2026">
                        <MockChart pts={PTS_Y2026} gradId="mockFillY2026" xs={XS_Y2026} />
                    </div>
                    <div className="mg-chart mg-chart-y2025">
                        <MockChart pts={PTS_Y2025} gradId="mockFillY2025" xs={XS_Y2025} />
                    </div>
                    <div className="mg-chart mg-chart-cycle">
                        <MockChart pts={PTS_CYCLE} gradId="mockFillCycle" xs={XS_CYCLE} />
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            <div className="mg-f mg-f-y2026 items-center gap-2 leading-none font-medium">
                                Trending down by 9.43 % <TrendingDown className="h-4 w-4" />
                            </div>
                            <div className="mg-f mg-f-y2025 items-center gap-2 leading-none font-medium">
                                Trending down by 7.99 % <TrendingDown className="h-4 w-4" />
                            </div>
                            <div className="mg-f mg-f-cycle items-center gap-2 leading-none font-medium">
                                Trending down by 5.09 % <TrendingDown className="h-4 w-4" />
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                12 Jun&apos;25 - 18 Oct&apos;26
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
