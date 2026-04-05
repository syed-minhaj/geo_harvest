
import {
    MoveRight,
    Sprout,
    Droplets,
    Zap,
    ShieldCheck,
    BarChart3,
    Github
} from "lucide-react";

import { HomeNavbar as Navbar } from "./components/Navbar";
import Link from "next/link";

const MetricChip = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] uppercase tracking-widest font-bold shadow-sm">
        <span className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />
        <span className="text-slate-500 dark:text-slate-400 text-nowrap">{label}:</span>
        <span className="text-slate-900 dark:text-white text-nowrap">{value}</span>
    </div>
);

export default function App() {
    const features = [
        {
            id: 1,
            title: "Moisture Level",
            content: "Monitor crop moisture levels and identify areas that require irrigation with precision mapping.",
            icon: <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
            color: "bg-blue-500/10 dark:bg-blue-500/20",
            tag: "Hydration",
            url: "/mositure.png"
        },
        {
            id: 2,
            title: "Nitrogen Level",
            content: "Monitor crop nitrogen levels and identify areas that require specific fertilization protocols.",
            icon: <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
            color: "bg-amber-500/10 dark:bg-amber-500/20",
            tag: "Nutrition",
            url: "/n.png"
        },
        {
            id: 3,
            title: "Crop Stress",
            content: "Early detection of crop stress and growth deficiencies via deep spectral analysis.",
            icon: <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
            color: "bg-emerald-500/10 dark:bg-emerald-500/20",
            tag: "Health Index",
            url: "/stress-after.png"
        },
        {
            id: 4,
            title: "Phosphorus Level",
            content: "High-resolution phosphorus mapping to optimize soil composition and nutrient balance.",
            icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
            color: "bg-purple-500/10 dark:bg-purple-500/20",
            tag: "Soil Quality",
            url: "/p.png"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020203] text-slate-900 dark:text-slate-50 selection:bg-emerald-500/30 overflow-x-hidden font-sans transition-colors duration-300">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 pointer-events-none" />
            </div>
            <Navbar />
            <main className="relative pt-32 pb-20 px-6">
                <section className="max-w-5xl mx-auto text-center mb-32">
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-xl dark:shadow-2xl">
                            <MetricChip label="Sentinel-2" value="Active" color="bg-emerald-500" />
                            <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />
                            <MetricChip label="Refresh" value="5 Days" color="bg-blue-500" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[1.1] mb-8 bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-white/50 bg-clip-text text-transparent">
                        Farming from <span className="text-emerald-600 dark:text-emerald-500">Space.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-12">
                        Monitor crop health, optimize irrigation, and boost yields with professional satellite analysis.
                        The future of agriculture is managed from orbit.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <Link href={"/app/fields/create"} className="h-14 px-10 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-black font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 dark:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 flex items-center">
                            Get Started
                        </Link>
                        <a target="_blank" href="https://github.com/syed-minhaj/geo_harvest" 
                            className="h-14 px-10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-semibold rounded-2xl border border-slate-200 dark:border-white/10 transition-all flex items-center gap-3 group shadow-sm">
                            Learn More <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </section>
                <section className="max-w-7xl mx-auto mb-40 relative">
                    <div className="absolute -inset-4 bg-emerald-500/10 dark:bg-emerald-500/20 blur-[100px] rounded-full opacity-20" />
                    <div className="relative p-2 rounded-[2rem] bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                        <div className="rounded-[1.6rem] overflow-hidden border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/40">
                            <img src="/startPage.png" className="w-full h-auto shadow-2xl" alt="GeoHarvest Platform" />
                            <div className="absolute bottom-10 left-10 p-6 rounded-2xl bg-white/90 dark:bg-black/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl max-w-xs hidden md:block border-l-4 border-l-emerald-500 shadow-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Dashboard</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Precision spectral data visualization for large-scale field management.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div>
                            <span className="text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Powered by Sentinel</span>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Advanced Spectral Insights.</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed font-light">
                            Utilizing the Sentinel-2 constellation to provide 10m resolution analysis across critical vegetation indices.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((f) => (
                            <div key={f.id} className="group relative p-4 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-emerald-200 dark:hover:border-white/10 transition-all duration-500 flex flex-col h-full shadow-sm hover:shadow-md">
                                <div className="relative aspect-[3/4] w-full mb-6 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner">
                                    <img src={f.url} alt={f.title} className="w-full h-full object-cover grayscale-0 sm:grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 dark:from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className={`absolute top-4 left-4 w-10 h-10 ${f.color} rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg`}>
                                        {f.icon}
                                    </div>
                                </div>
                                <div className="px-2 pb-4">
                                    <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-500 font-bold mb-3 uppercase tracking-tighter">
                                        {f.tag}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{f.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-light opacity-80">
                                        {f.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <footer className="mt-40 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-black/40 py-20 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter mb-6 text-slate-900 dark:text-white">
                                GeoHarvest
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm font-light leading-relaxed">
                                Empowering the next generation of farmers with space-borne intelligence and planetary-scale data analysis.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-slate-900 dark:text-white">Project</h4>
                            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-500">
                                <li className="flex items-center gap-2 font-medium"><Github className="w-4 h-4 text-slate-900 dark:text-slate-400" /><a href="https://github.com/syed-minhaj/geo_harvest" target="_blank" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Source Code</a></li>
                                <li className="font-medium"><a href="#" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Documentation</a></li>
                            </ul>
                        </div>
                        <div className="text-sm text-slate-500">
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-slate-900 dark:text-white">Legal</h4>
                            <ul className="space-y-4 font-medium">
                                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                                <li>© 2026 GeoHarvest</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                        <p>Data powered by ESA Sentinel Constellation</p>
                        <p>All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}