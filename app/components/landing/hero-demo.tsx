import Image from "next/image";
import { WindowChrome } from "./window";

const indices = [
    {
        key: "moisture",
        name: "Moisture",
        src: "/mositure.png",
        hint: "Irrigation gaps show up in the north-west quadrant.",
        readout: "waterRequirement",
        tag: "bg-blue-pale text-blue-ink dark:bg-[#12303F] dark:text-[#7CC6E8]",
        bar: "bg-blue-ink",
        label: "NDMI",
        clsInput: "peer/moisture sr-only",
        clsLabel: "peer-checked/moisture:text-ink dark:peer-checked/moisture:text-white peer-checked/moisture:after:opacity-100 peer-focus-visible/moisture:outline-2 peer-focus-visible/moisture:outline-offset-[-2px] peer-focus-visible/moisture:outline-blue-ink dark:peer-focus-visible/moisture:outline-[#7CC6E8]",
        clsPanel: "hidden peer-checked/moisture:block col-span-2 sm:col-span-4",
    },
    {
        key: "nitrogen",
        name: "Nitrogen",
        src: "/n.png",
        hint: "Variable uptake — top-dress 40 kg/ha on the red zones.",
        readout: "nitrogenRequirement",
        tag: "bg-yellow-pale text-yellow-ink dark:bg-[#3B3114] dark:text-[#E5C063]",
        bar: "bg-yellow-ink",
        label: "N",
        clsInput: "peer/nitrogen sr-only",
        clsLabel: "peer-checked/nitrogen:text-ink dark:peer-checked/nitrogen:text-white peer-checked/nitrogen:after:opacity-100 peer-focus-visible/nitrogen:outline-2 peer-focus-visible/nitrogen:outline-offset-[-2px] peer-focus-visible/nitrogen:outline-blue-ink dark:peer-focus-visible/nitrogen:outline-[#7CC6E8]",
        clsPanel: "hidden peer-checked/nitrogen:block col-span-2 sm:col-span-4",
    },
    {
        key: "stress",
        name: "Stress",
        src: "/stress-after.png",
        hint: "Early stress detected before the canopy shows it.",
        readout: "cropStress",
        tag: "bg-green-pale text-green-ink dark:bg-[#1C2E1C] dark:text-[#8FBE8C]",
        bar: "bg-green-ink",
        label: "STRESS",
        clsInput: "peer/stress sr-only",
        clsLabel: "peer-checked/stress:text-ink dark:peer-checked/stress:text-white peer-checked/stress:after:opacity-100 peer-focus-visible/stress:outline-2 peer-focus-visible/stress:outline-offset-[-2px] peer-focus-visible/stress:outline-blue-ink dark:peer-focus-visible/stress:outline-[#7CC6E8]",
        clsPanel: "hidden peer-checked/stress:block col-span-2 sm:col-span-4",
    },
    {
        key: "phosphorus",
        name: "Phosphorus",
        src: "/p.png",
        hint: "Nutrient balance differs from field edge to centre.",
        readout: "phosphorusRequirement",
        tag: "bg-purple-pale text-purple-ink dark:bg-[#29233D] dark:text-[#AE9FE0]",
        bar: "bg-purple-ink",
        label: "P",
        clsInput: "peer/phosphorus sr-only",
        clsLabel: "peer-checked/phosphorus:text-ink dark:peer-checked/phosphorus:text-white peer-checked/phosphorus:after:opacity-100 peer-focus-visible/phosphorus:outline-2 peer-focus-visible/phosphorus:outline-offset-[-2px] peer-focus-visible/phosphorus:outline-blue-ink dark:peer-focus-visible/phosphorus:outline-[#7CC6E8]",
        clsPanel: "hidden peer-checked/phosphorus:block col-span-2 sm:col-span-4",
    },
] as const;

export function HeroDemo() {
    return (
        <section
            aria-label="Interactive spectral index demo"
            className="relative grid grid-cols-2 sm:grid-cols-4 rounded-xl border border-[#EAEAEA] dark:border-[#242D27] bg-white dark:bg-[#121714] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
        >
            {indices.map((idx) => (
                <input
                    key={idx.key}
                    type="radio"
                    name="index-demo"
                    id={`index-${idx.key}`}
                    className={idx.clsInput}
                    defaultChecked={idx.key === "moisture"}
                />
            ))}

            <WindowChrome title="GeoHarvest · Field view — Sentinel-2 L2A" className="col-span-2 sm:col-span-4" />

            {indices.map((idx, i) => (
                <label
                    key={idx.key}
                    htmlFor={`index-${idx.key}`}
                    className={`cursor-pointer truncate text-center px-3 py-2.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-ink-soft dark:text-[#96A29A] ${
                        i < indices.length - 1 ? "border-r border-[#EAEAEA] dark:border-[#242D27]" : ""
                    } border-b border-[#EAEAEA] dark:border-[#242D27] hover:bg-[#F7F6F3] dark:hover:bg-[#1B211D] transition-colors relative after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-[2px] after:bg-current after:opacity-0 ${idx.clsLabel}`}
                >
                    {idx.name}
                </label>
            ))}

            {indices.map((idx) => (
                <figure key={idx.key} className={idx.clsPanel}>
                    <div className="relative aspect-[16/10] bg-[#0A0D0B]">
                        <div className="survey-grid absolute inset-0" aria-hidden />
                        <div className="text-white/40 pointer-events-none" aria-hidden>
                            <div className="rule-h top-1/2" />
                            <div className="rule-v left-1/2" />
                        </div>
                        <Image
                            src={idx.src}
                            alt={`Sentinel-2 ${idx.name.toLowerCase()} heatmap`}
                            fill
                            priority={idx.key === "moisture"}
                            className="pixelated object-cover [object-position:center]"
                            sizes="(max-width: 1024px) 100vw, 560px"
                        />
                        <span
                            className={`absolute top-3 left-3 px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.08em] ${idx.tag}`}
                        >
                            {idx.label}
                        </span>
                        <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white/50 bg-black/40 px-1.5 py-0.5 rounded">
                            30.3753°N 69.3451°E
                        </span>
                    </div>
                    <figcaption className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                        <p className="text-xs text-ink-soft dark:text-[#96A29A]">{idx.hint}</p>
                        <span
                            className={`font-mono text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-sm text-white dark:text-black ${idx.bar}`}
                        >
                            {idx.readout}
                        </span>
                    </figcaption>
                </figure>
            ))}
        </section>
    );
}
