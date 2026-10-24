import Image from "next/image";
import { WindowChrome } from "./window";

const readings = [
    {
        code: "NDMI · 10 M/PX",
        title: "Moisture level",
        copy: "Spot irrigation gaps the eye can't see — mapped from near-infrared reflectance.",
        sample: "0.31 · LOW SW",
        tag: "bg-blue-pale text-blue-ink dark:bg-[#12303F] dark:text-[#7CC6E8]",
    },
    {
        code: "N · SENTINEL-2",
        title: "Nitrogen level",
        copy: "Variable-rate fertilizer plans, zoned per pixel instead of per field.",
        sample: "57 KG/HA",
        tag: "bg-yellow-pale text-yellow-ink dark:bg-[#3B3114] dark:text-[#E5C063]",
    },
    {
        code: "STRESS · NDVI",
        title: "Crop stress",
        copy: "Detect stress early from spectral changes, before the canopy shows it.",
        sample: "LOW · 92% CANOPY",
        tag: "bg-green-pale text-green-ink dark:bg-[#1C2E1C] dark:text-[#8FBE8C]",
    },
    {
        code: "P · SOIL MAP",
        title: "Phosphorus level",
        copy: "High-resolution phosphorus mapping to balance soil composition.",
        sample: "18 PPM",
        tag: "bg-purple-pale text-purple-ink dark:bg-[#29233D] dark:text-[#AE9FE0]",
    },
] as const;

export function Bento() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Large: real dashboard capture */}
            <figure className="lg:col-span-8 flex flex-col rounded-xl border border-[#EAEAEA] dark:border-[#242D27] bg-white dark:bg-[#121714] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                <WindowChrome title="GeoHarvest · Farm at a glance — live dashboard" />
                <div className="relative aspect-[1349/604] flex-1 bg-white dark:bg-[#121714]">
                    <Image
                        src="/startPage.png"
                        alt="GeoHarvest dashboard showing a Sentinel-2 heatmap on an interactive field map"
                        fill
                        sizes="(max-width: 1024px) 100vw, 860px"
                        className="object-cover object-top"
                    />
                </div>
                <figcaption className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-[#EAEAEA] dark:border-[#242D27]">
                    <p className="text-xs text-ink-soft dark:text-[#96A29A]">
                        Draw a field, pick a crop, and the satellites do the counting.
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft dark:text-[#96A29A] text-right">
                        Copernicus Sentinel-2 · © OpenStreetMap
                    </span>
                </figcaption>
            </figure>

            {/* Small: 4 index cards */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {readings.map((r) => (
                    <article
                        key={r.code}
                        className="p-5 rounded-xl border border-[#EAEAEA] dark:border-[#242D27] bg-white dark:bg-[#121714] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow"
                    >
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                            <span
                                className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.08em] ${r.tag}`}
                            >
                                {r.code}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft dark:text-[#96A29A]">
                                {r.sample}
                            </span>
                        </div>
                        <h3 className="text-sm font-semibold text-ink dark:text-[#E7EDE8] mb-1">{r.title}</h3>
                        <p className="text-xs leading-relaxed text-ink-soft dark:text-[#96A29A]">{r.copy}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}
