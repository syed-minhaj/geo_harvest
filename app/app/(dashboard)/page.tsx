import { Suspense } from "react";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { db } from "@/app/lib/drizzle";
import { field, crop, avgPixelValue } from "@/db/schema";
import { eq, inArray, or } from "drizzle-orm";
import { MapOverview } from "@/app/components/MapOverview";
import { getDateShort } from "@/app/utils/Date";
import { FieldCard } from "@/app/components/FieldCard";
import type { ImageType } from "@/app/types";

const defaultFieldIds = ["06402424-72fa-4b52-8d2f-6bd81c56c2bf", "9eee4301-3096-4d44-9542-8c31dccb520d"];

const defaultFields = await db.select().from(field).where(
    or(eq(field.id, defaultFieldIds[0]), eq(field.id, defaultFieldIds[1]))
);

function getHealthDot(pixelValues: { fieldId: string; imageType: ImageType; imageDate: string; value: number | null }[], fieldId: string) {
    const types: ImageType[] = ["waterRequirement", "nitrogenRequirement", "phosphorusRequirement", "cropStress"];
    const values = types.map(type => {
        const matches = pixelValues.filter(p => p.fieldId === fieldId && p.imageType === type && p.value !== null);
        matches.sort((a, b) => new Date(b.imageDate).getTime() - new Date(a.imageDate).getTime());
        return matches[0]?.value ?? null;
    }).filter((v): v is number => v !== null);
    if (!values.length) return "gray";
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg >= 0.66) return "green";
    if (avg >= 0.33) return "yellow";
    return "red";
}

async function Main() {
    const session = await auth.api.getSession({ headers: await headers() });

    const fields = session
        ? await db.select().from(field).where(eq(field.ownerId, session.user.id))
        : defaultFields;

    if (!fields.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-2">
                <p className="text-lg font-medium">No fields found</p>
                <p className="text-sm opacity-66">Create a field to see your farm at a glance</p>
            </div>
        )
    }

    const fieldIds = fields.map(f => f.id);
    const crops = await db.select().from(crop).where(inArray(crop.fieldId, fieldIds));
    const pixelValues = await db.select().from(avgPixelValue).where(inArray(avgPixelValue.fieldId, fieldIds));

    const totalFields = fields.length;
    const activeCrops = new Set(crops.map(c => c.name)).size;
    const allDates = fields.flatMap(f => f.imagesDates).filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const latestData = allDates.length ? getDateShort(new Date(allDates[0])) : "N/A";
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFields = fields.filter(f => f.imagesDates.some(d => new Date(d) >= thirtyDaysAgo)).length;

    const latestCropPerField = new Map<string, { name: string; seedVariety: string; planted_at: Date | null }>();
    for (const c of crops) {
        if (!latestCropPerField.has(c.fieldId)) {
            latestCropPerField.set(c.fieldId, { name: c.name, seedVariety: c.seedVariety, planted_at: c.planted_at });
        }
    }

    const healthDotColors: Record<string, string> = {
        green: "bg-green-500",
        yellow: "bg-yellow-500",
        red: "bg-red-500",
        gray: "bg-gray-400",
    };

    const recentThree = [...fields]
        .map(f => ({
            ...f,
            latestDate: f.imagesDates.filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0],
        }))
        .sort((a, b) => new Date(b.latestDate || 0).getTime() - new Date(a.latestDate || 0).getTime())
        .slice(0, 3);

    return (
        <div className="flex flex-col gap-4 mb-4">
            <MapOverview fields={fields} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2 bg-bg2 rounded-r1 border border-input w-full p-4">
                    <p className="font-medium opacity-66">Total Fields</p>
                    <p className="font-medium text-2xl">{totalFields}</p>
                </div>
                <div className="flex flex-col gap-2 bg-bg2 rounded-r1 border border-input w-full p-4">
                    <p className="font-medium opacity-66">Active Crops</p>
                    <p className="font-medium text-2xl">{activeCrops}</p>
                </div>
                <div className="flex flex-col gap-2 bg-bg2 rounded-r1 border border-input w-full p-4">
                    <p className="font-medium opacity-66">Latest Data</p>
                    <p className="font-medium text-2xl">{latestData}</p>
                </div>
                <div className="flex flex-col gap-2 bg-bg2 rounded-r1 border border-input w-full p-4">
                    <p className="font-medium opacity-66">Fields w/ Recent Data</p>
                    <p className="font-medium text-2xl">{recentFields}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentThree.map(f => (
                    <FieldCard
                        key={f.id}
                        id={f.id}
                        name={f.name}
                        coordinates={f.coordinates}
                        imagesDates={f.imagesDates}
                        crop={latestCropPerField.get(f.id) ?? null}
                    />
                ))}
            </div>
            <div className="bg-bg2 rounded-r1 border border-input p-4">
                <h2 className="text-lg font-semibold mb-3">Fields</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-input">
                                <th className="text-left py-2 pr-4 font-medium opacity-66">Name</th>
                                <th className="text-left py-2 pr-4 font-medium opacity-66">Crop</th>
                                <th className="text-left py-2 pr-4 font-medium opacity-66">Latest Image</th>
                                <th className="text-left py-2 pr-4 font-medium opacity-66">Health</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map(f => {
                                const fieldCrop = latestCropPerField.get(f.id);
                                const dates = f.imagesDates.filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                                const latestDate = dates[0] ? new Date(dates[0]).toDateString() : "No data";
                                const health = getHealthDot(pixelValues, f.id);
                                return (
                                    <tr key={f.id} className="border-b border-input/50">
                                        <td className="py-2 pr-4">
                                            <a href={`/app/fields/${f.id}`} className="text-blue-500 hover:underline">{f.name}</a>
                                        </td>
                                        <td className="py-2 pr-4 capitalize">{fieldCrop?.name ?? "—"}</td>
                                        <td className="py-2 pr-4">{latestDate}</td>
                                        <td className="py-2">
                                            <div className={`w-3 h-3 rounded-full ${healthDotColors[health]}`} />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function Skeleton() {
    return (
        <div className="flex flex-col gap-4 mb-4 animate-pulse">
            <div className="w-full h-[300px] bg-bg2 rounded-r1 border border-input" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="w-full bg-bg2 rounded-r1 border border-input h-24.5 p-4" />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 rounded-[0.75rem] border bg-white dark:bg-secondary/15 shadow-sm flex flex-col gap-2 animate-pulse">
                        <div className="flex flex-row gap-4">
                            <div className="rounded-[0.5rem] w-55 h-55 bg-muted" />
                            <div className="flex flex-col gap-2">
                                <div className="h-6 w-24 bg-muted rounded-md" />
                                <div className="h-4 w-20 bg-muted rounded-md" />
                            </div>
                        </div>
                        <div className="h-px bg-border my-1" />
                        <div className="h-10 w-70 flex gap-8">
                            <div className="h-4 w-14 bg-muted rounded-md" />
                            <div className="h-4 w-20 bg-muted rounded-md" />
                        </div>
                        <div className="h-px bg-border my-1" />
                        <div className="h-11 w-70 space-y-2">
                            <div className="h-4 w-28 bg-muted rounded-md" />
                            <div className="h-4 w-24 bg-muted rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-full bg-bg2 rounded-r1 border border-input h-48 p-4" />
        </div>
    )
}

export default function Page() {
    return (
        <div className="flex flex-col gap-4 w-full px-4 overflow-x-hidden">
            <div className="flex flex-row items-center mt-4">
                <h1 className="text-xl font-semibold">Farm at a Glance</h1>
            </div>
            <Suspense fallback={<Skeleton />}>
                <Main />
            </Suspense>
        </div>
    )
}
