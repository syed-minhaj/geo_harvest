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
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEDE7] dark:bg-white/5 border border-[#E4E2DB] dark:border-white/10 text-[10px] uppercase tracking-widest font-bold shadow-sm">
        <span className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />
        <span className="text-[#7A8179] dark:text-[#96A29A] text-nowrap">{label}:</span>
        <span className="text-[#3A4239] dark:text-white text-nowrap">{value}</span>
    </div>
);

export default function App() {
    const features = [
        {
            id: 1,
            title: "Moisture Level",
            content: "Monitor crop moisture levels and identify areas that require irrigation with precision mapping.",
            icon: <Droplets className="w-5 h-5 text-[#2F7D9E] dark:text-[#54A5C4]" />,
            color: "bg-[#2F7D9E]/10 dark:bg-[#54A5C4]/20",
            tag: "Hydration",
            url: "/mositure.png"
        },
        {
            id: 2,
            title: "Nitrogen Level",
            content: "Monitor crop nitrogen levels and identify areas that require specific fertilization protocols.",
            icon: <Zap className="w-5 h-5 text-[#C78A2F] dark:text-[#E0A24E]" />,
            color: "bg-[#C78A2F]/10 dark:bg-[#E0A24E]/20",
            tag: "Nutrition",
            url: "/n.png"
        },
        {
            id: 3,
            title: "Crop Stress",
            content: "Early detection of crop stress and growth deficiencies via deep spectral analysis.",
            icon: <Sprout className="w-5 h-5 text-[#0F5C36] dark:text-[#3C9A63]" />,
            color: "bg-[#4E9E6B]/10 dark:bg-[#5FAD7B]/20",
            tag: "Health Index",
            url: "/stress-after.png"
        },
        {
            id: 4,
            title: "Phosphorus Level",
            content: "High-resolution phosphorus mapping to optimize soil composition and nutrient balance.",
            icon: <ShieldCheck className="w-5 h-5 text-[#7D6FBE] dark:text-[#9C8FD1]" />,
            color: "bg-[#7D6FBE]/10 dark:bg-[#9C8FD1]/20",
            tag: "Soil Quality",
            url: "/p.png"
        }
    ];

    return (
        <div className="min-h-screen bg-[#F2F0EA] dark:bg-[#080B09] text-[#3A4239] dark:text-[#E7EDE8] selection:bg-[#0F5C36]/25 overflow-x-hidden font-sans transition-colors duration-300">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0F5C36]/5 dark:bg-[#3C9A63]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2F7D9E]/5 dark:bg-[#54A5C4]/10 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 pointer-events-none" />
            </div>
            <Navbar />
            <main className="relative pt-32 pb-20 px-6">
                <section className="max-w-5xl mx-auto text-center mb-32">
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 dark:bg-white/[0.03] border border-[#E4E2DB] dark:border-white/10 backdrop-blur-md shadow-xl dark:shadow-2xl">
                            <MetricChip label="Sentinel-2" value="Active" color="bg-[#3C9A63]" />
                            <div className="w-px h-4 bg-[#E4E2DB] dark:bg-white/10" />
                            <MetricChip label="Refresh" value="7 Days" color="bg-[#2F7D9E]" />
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[1.1] mb-8 bg-gradient-to-b from-[#3A4239] to-[#7A8179] dark:from-white dark:to-white/50 bg-clip-text text-transparent">
                        Farming from <span className="text-[#0F5C36] dark:text-[#3C9A63]">Space.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#7A8179] dark:text-[#96A29A] max-w-2xl mx-auto font-light leading-relaxed mb-12">
                        Monitor crop health, optimize irrigation, and boost yields with professional satellite analysis.
                        The future of agriculture is managed from orbit.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <Link href={"/app"} className="h-14 px-10 bg-[#0F5C36] dark:bg-[#3C9A63] hover:bg-[#0B4C2C] dark:hover:bg-[#4CB373] text-white dark:text-[#0B120D] font-bold rounded-2xl transition-all shadow-lg shadow-[#0F5C36]/25 dark:shadow-[0_0_30px_rgba(60,154,99,0.35)] hover:scale-[1.02] active:scale-95 flex items-center">
                            Get Started
                        </Link>
                        <a target="_blank" href="https://github.com/syed-minhaj/geo_harvest" 
                            className="h-14 px-10 bg-[#FBFAF6] dark:bg-white/5 hover:bg-[#EFEDE7] dark:hover:bg-white/10 text-[#3A4239] dark:text-white font-semibold rounded-2xl border border-[#E4E2DB] dark:border-white/10 transition-all flex items-center gap-3 group shadow-sm">
                            Learn More <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </section>
                <section className="max-w-7xl mx-auto mb-40 relative">
                    <div className="absolute -inset-4 bg-[#0F5C36]/10 dark:bg-[#3C9A63]/20 blur-[100px] rounded-full opacity-20" />
                    <div className="relative p-2 rounded-[2rem] bg-[#FBFAF6]/70 dark:bg-white/5 border border-[#E4E2DB] dark:border-white/10 backdrop-blur-sm shadow-xl overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0F5C36] to-transparent opacity-50" />
                        <div className="rounded-[1.6rem] overflow-hidden border border-[#E4E2DB] dark:border-white/5 bg-[#FBFAF6]/85 dark:bg-black/40">
                            <img src="/startPage.png" className="w-full h-auto shadow-2xl" alt="GeoHarvest Platform" />
                            <div className="absolute bottom-10 left-10 p-6 rounded-2xl bg-[#FBFAF6]/90 dark:bg-black/60 border border-[#E4E2DB] dark:border-white/10 backdrop-blur-xl max-w-xs hidden md:block border-l-4 border-l-[#0F5C36] shadow-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <BarChart3 className="w-5 h-5 text-[#0F5C36] dark:text-[#3C9A63]" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#0F5C36] dark:text-[#3C9A63]">Live Dashboard</span>
                                </div>
                                <p className="text-sm text-[#7A8179] dark:text-[#CFD8D0] font-medium">Precision spectral data visualization for large-scale field management.</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div>
                            <span className="text-[#0F5C36] dark:text-[#3C9A63] font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Powered by Sentinel</span>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#3A4239] dark:text-white">Advanced Spectral Insights.</h2>
                        </div>
                        <p className="text-[#7A8179] dark:text-[#96A29A] max-w-md text-sm leading-relaxed font-light">
                            Utilizing the Sentinel-2 constellation to provide 10m resolution analysis across critical vegetation indices.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((f) => (
                            <div key={f.id} className="group relative p-4 rounded-3xl bg-[#FBFAF6] dark:bg-white/[0.02] border border-[#E4E2DB] dark:border-white/5 hover:bg-[#F3F1EA] dark:hover:bg-white/[0.04] hover:border-[#D6DED7] dark:hover:border-white/10 transition-all duration-500 flex flex-col h-full shadow-sm hover:shadow-md">
                                <div className="relative aspect-[3/4] w-full mb-6 rounded-2xl overflow-hidden border border-[#E9E7E1] dark:border-white/5 shadow-inner">
                                    <img src={f.url} alt={f.title} className="w-full h-full object-cover grayscale-0 sm:grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#3A4239]/40 dark:from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className={`absolute top-4 left-4 w-10 h-10 ${f.color} rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg`}>
                                        {f.icon}
                                    </div>
                                </div>
                                <div className="px-2 pb-4">
                                    <div className="inline-block px-2 py-0.5 rounded bg-[#0F5C36]/10 text-[10px] text-[#0F5C36] dark:text-[#3C9A63] font-bold mb-3 uppercase tracking-tighter">
                                        {f.tag}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-[#3A4239] dark:text-white">{f.title}</h3>
                                    <p className="text-[#7A8179] dark:text-[#96A29A] text-xs leading-relaxed font-light opacity-80">
                                        {f.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <footer className="mt-40 border-t border-[#E4E2DB] dark:border-white/5 bg-[#FBFAF6] dark:bg-black/40 py-20 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter mb-6 text-[#3A4239] dark:text-white">
                                GeoHarvest
                            </div>
                            <p className="text-[#7A8179] dark:text-[#96A29A] max-w-sm font-light leading-relaxed">
                                Empowering the next generation of farmers with space-borne intelligence and planetary-scale data analysis.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-[#3A4239] dark:text-white">Project</h4>
                            <ul className="space-y-4 text-sm text-[#7A8179] dark:text-[#96A29A]">
                                <li className="flex items-center gap-2 font-medium"><Github className="w-4 h-4 text-[#3A4239] dark:text-[#96A29A]" /><a href="https://github.com/syed-minhaj/geo_harvest" target="_blank" className="hover:text-[#0F5C36] dark:hover:text-white transition-colors">Source Code</a></li>
                                <li className="font-medium"><a href="#" className="hover:text-[#0F5C36] dark:hover:text-white transition-colors">Documentation</a></li>
                            </ul>
                        </div>
                        <div className="text-sm text-[#7A8179]">
                            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-[#3A4239] dark:text-white">Legal</h4>
                            <ul className="space-y-4 font-medium">
                                <li><a href="#" className="hover:text-[#0F5C36] dark:hover:text-white transition-colors">Privacy Policy</a></li>
                                <li>© 2026 GeoHarvest</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-[#E4E2DB] dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#9AA7A0]">
                        <p>Data powered by ESA Sentinel Constellation</p>
                        <p>All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}