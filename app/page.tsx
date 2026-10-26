import Link from "next/link";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";

import { HomeNavbar as Navbar } from "./components/Navbar";
import { HeroDemo } from "./components/landing/hero-demo";
import { Bento } from "./components/landing/bento";
import { Storyboard } from "./components/landing/storyboard";

function SectionHead({
    eyebrow,
    title,
    blurb,
}: {
    eyebrow: string;
    title: string;
    blurb?: string;
}) {
    return (
        <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft dark:text-[#96A29A] mb-4">
                {eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-[-0.02em] text-ink dark:text-[#E7EDE8]">
                {title}
            </h2>
            {blurb ? (
                <p className="mt-4 text-sm leading-relaxed text-ink-soft dark:text-[#96A29A]">{blurb}</p>
            ) : null}
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-canvas dark:bg-[#0B0E0C] text-ink dark:text-[#E7EDE8] selection:bg-green-pale selection:text-green-ink font-sans">
            {/* Graticule backdrop + satellite pass — static CSS, no shimmer */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
                <div
                    className="absolute inset-0 opacity-[0.5] dark:opacity-[0.25]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, rgb(0 0 0 / 0.025) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.025) 1px, transparent 1px)",
                        backgroundSize: "6rem 6rem",
                    }}
                />
                <svg
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[62%] w-[140vw] h-[140vw] max-w-none"
                    viewBox="0 0 100 100"
                >
                    <path d="M0 30 Q 50 18 100 26" fill="none" stroke="rgb(20 20 20 / 0.06)" strokeWidth="0.15" strokeDasharray="1 0.8" />
                    <path d="M0 74 Q 50 86 100 78" fill="none" stroke="rgb(52 101 56 / 0.14)" strokeWidth="0.15" strokeDasharray="1 0.8" />
                </svg>
            </div>

            <header className="relative">
                <Navbar />
            </header>

            <main className="relative">
                {/* Hero — left-aligned copy + interactive field view */}
                <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-10 lg:gap-14 items-start">
                        <div className="reveal max-w-xl">
                            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft dark:text-[#96A29A] border border-[#EAEAEA] dark:border-[#242D27] rounded-full px-3 py-1.5 bg-white dark:bg-[#121714] mb-8">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-ink dark:bg-[#5FAD7B]" />
                                Live · Sentinel-2 · 7-day refresh
                            </p>
                            <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-[-0.03em] text-ink dark:text-[#E7EDE8]">
                                Farming from{" "}
                                <em className="italic text-green-ink dark:text-[#5FAD7B]">
                                    orbit
                                </em>
                                ,<br />
                                decided on the ground.
                            </h1>
                            <p className="mt-6 text-base leading-relaxed text-ink-soft dark:text-[#96A29A] max-w-md">
                                GeoHarvest turns Sentinel-2 satellite passes into field maps: crop
                                moisture, nitrogen, phosphorus and stress. No drones, no guesswork —
                                just the next pixel to fix.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Link
                                    href="/app"
                                    className="h-11 px-6 inline-flex items-center gap-1.5 rounded-md bg-ink dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-[#333] dark:hover:bg-[#E5E5E5] active:scale-[0.98] transition-[background-color,transform]"
                                >
                                    Open the app
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <a
                                    href="https://github.com/syed-minhaj/geo_harvest"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-11 px-6 inline-flex items-center gap-1.5 rounded-md border border-[#EAEAEA] dark:border-[#242D27] bg-white dark:bg-[#121714] text-sm font-medium text-ink dark:text-[#E7EDE8] hover:bg-[#F7F6F3] dark:hover:bg-[#1B211D] active:scale-[0.98] transition-colors"
                                >
                                    <Github className="w-4 h-4" />
                                    Source
                                </a>
                            </div>
                            <dl className="mt-10 flex gap-8 border-t border-[#EAEAEA] dark:border-[#242D27] pt-5">
                                {[
                                    ["Resolution", "10 m/px"],
                                    ["Refresh", "Every 5–7 days"],
                                    ["Indices", "NDMI · N · P · Stress"],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft dark:text-[#96A29A]">
                                            {k}
                                        </dt>
                                        <dd className="mt-1 font-mono text-xs text-ink dark:text-[#E7EDE8]">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                        <div className="reveal">
                            <HeroDemo />
                            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#9B9B98] dark:text-[#6E7A71]">
                                ↑ Real Sentinel-2 rasters — click an index to switch layers
                            </p>
                        </div>
                    </div>
                </section>

                {/* Bento showcase */}
                <section className="max-w-6xl mx-auto px-5 py-20 border-t border-[#EAEAEA] dark:border-[#242D27]">
                    <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <SectionHead
                            eyebrow="What the satellite sees"
                            title="One dashboard, four readings."
                        />
                        <p className="max-w-xs text-sm leading-relaxed text-ink-soft dark:text-[#96A29A] md:text-right">
                            Each pass produces a map layer per index. Hover a field, read the worst
                            zone, fix it before yield loses a digit.
                        </p>
                    </div>
                    <div className="reveal">
                        <Bento />
                    </div>
                </section>

                {/* Storyboard — how it works */}
                <section className="max-w-6xl mx-auto px-5 py-20 border-t border-[#EAEAEA] dark:border-[#242D27]">
                    <div className="reveal mb-14">
                        <SectionHead
                            eyebrow="How it works"
                            title="Three steps, one field."
                            blurb="The whole workflow is two clicks and a polygon. Below is every screen you'll touch."
                        />
                    </div>
                    <Storyboard />
                </section>
            </main>

            <footer className="relative border-t border-[#EAEAEA] dark:border-[#242D27] bg-white dark:bg-[#121714]">
                <div className="max-w-6xl mx-auto px-5 py-16 flex flex-col md:flex-row justify-between gap-10">
                    <div className="max-w-sm">
                        <p className="text-lg font-bold tracking-tight text-ink dark:text-[#E7EDE8]">GeoHarvest</p>
                        <p className="mt-3 text-xs leading-relaxed text-ink-soft dark:text-[#96A29A]">
                            Space-borne field intelligence for farmers who negotiate with weather.
                        </p>
                    </div>
                    <div className="flex gap-16">
                        <ul className="space-y-3 text-xs text-ink-soft dark:text-[#96A29A]">
                            <li className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink dark:text-[#E7EDE8] mb-2">
                                Project
                            </li>
                            <li className="flex items-center gap-1.5">
                                <Github className="w-3.5 h-3.5" />
                                <a href="https://github.com/syed-minhaj/geo_harvest" target="_blank" rel="noreferrer" className="hover:text-ink dark:hover:text-white transition-colors">
                                    Source code
                                </a>
                                <ArrowUpRight className="w-3 h-3" />
                            </li>
                            <li>
                                <Link href="/app" className="hover:text-ink dark:hover:text-white transition-colors">
                                    Try now
                                </Link>
                            </li>
                        </ul>
                        <ul className="space-y-3 text-xs text-ink-soft dark:text-[#96A29A]">
                            <li className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink dark:text-[#E7EDE8] mb-2">
                                Legal
                            </li>
                            <li>© 2026 GeoHarvest</li>
                            <li className="font-mono text-[10px] uppercase tracking-[0.1em]">
                                Data · ESA Sentinel-2
                            </li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
