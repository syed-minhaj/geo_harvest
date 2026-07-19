import { getDateShort } from "@/app/utils/Date";

export type FieldData = { id: string; name: string; imagesDates: string[] };
export type CropData = { name: string; fieldId: string };
export type PixelValueData = { fieldId: string; imageType: "waterRequirement" | "nitrogenRequirement" | "phosphorusRequirement" | "cropStress"; imageDate: string; value: number | null };
export type OverviewDataItem = { date: string; water: number; nitrogen: number; phosphorus: number; stress: number };
export type FieldComparisonItem = { field: string; water: number; nitrogen: number; phosphorus: number; stress: number };
export type CropDistributionItem = { name: string; count: number; fill: string };
export type FreshnessItem = { name: string; latestDate: string; daysSince: number; status: "Recent" | "Normal" | "Stale" };

export type KPIs = {
    totalFields: number;
    activeCrops: number;
    totalDataPoints: number;
    latestData: string;
    recentFields: number;
    avgHealth: number;
    bestField: string;
    coverage: number;
};

const types = ["waterRequirement", "nitrogenRequirement", "phosphorusRequirement", "cropStress"] as const;

function getFieldAvgLatest(fieldId: string, pixelValues: PixelValueData[]) {
    const values = types.map(type => {
        const matches = pixelValues.filter(p => p.fieldId === fieldId && p.imageType === type && p.value !== null);
        matches.sort((a, b) => new Date(b.imageDate).getTime() - new Date(a.imageDate).getTime());
        return matches[0]?.value ?? null;
    }).filter((v): v is number => v !== null);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
}

export function computeKPIs(fields: FieldData[], crops: CropData[], pixelValues: PixelValueData[]): KPIs {
    const totalFields = fields.length;
    const activeCrops = new Set(crops.map(c => c.name)).size;
    const totalDataPoints = pixelValues.length;
    const allDates = fields.flatMap(f => f.imagesDates).filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const latestData = allDates.length ? getDateShort(new Date(allDates[0])) : "N/A";
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentFields = fields.filter(f => f.imagesDates.some(d => new Date(d) >= thirtyDaysAgo)).length;

    const fieldHealth = fields.map(f => ({ name: f.name, avg: getFieldAvgLatest(f.id, pixelValues) })).filter(f => !isNaN(f.avg));
    const avgHealth = fieldHealth.length ? fieldHealth.reduce((a, b) => a + b.avg, 0) / fieldHealth.length : 0;
    const bestFieldEntry = fieldHealth.length ? fieldHealth.reduce((best, curr) => curr.avg > best.avg ? curr : best) : null;
    const bestField = bestFieldEntry ? bestFieldEntry.name : "N/A";

    const uniqueFieldDates = new Set(pixelValues.map(p => `${p.fieldId}-${p.imageDate}`));
    const coverage = uniqueFieldDates.size > 0 ? Math.round(totalDataPoints / (uniqueFieldDates.size * 4) * 100) : 0;

    return { totalFields, activeCrops, totalDataPoints, latestData, recentFields, avgHealth, bestField, coverage };
}

export function getOverviewData(pixelValues: PixelValueData[]): OverviewDataItem[] {
    const typeMap: Record<string, "water" | "nitrogen" | "phosphorus" | "stress"> = {
        waterRequirement: "water",
        nitrogenRequirement: "nitrogen",
        phosphorusRequirement: "phosphorus",
        cropStress: "stress",
    };
    const dateGroups: Record<string, { water: number[]; nitrogen: number[]; phosphorus: number[]; stress: number[] }> = {};
    pixelValues.forEach(p => {
        if (p.value === null) return;
        const key = typeMap[p.imageType];
        if (!dateGroups[p.imageDate]) dateGroups[p.imageDate] = { water: [], nitrogen: [], phosphorus: [], stress: [] };
        dateGroups[p.imageDate][key].push(p.value);
    });
    return Object.entries(dateGroups)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([date, groups]) => ({
            date: getDateShort(new Date(date)),
            water: groups.water.length ? groups.water.reduce((a, b) => a + b, 0) / groups.water.length : 0,
            nitrogen: groups.nitrogen.length ? groups.nitrogen.reduce((a, b) => a + b, 0) / groups.nitrogen.length : 0,
            phosphorus: groups.phosphorus.length ? groups.phosphorus.reduce((a, b) => a + b, 0) / groups.phosphorus.length : 0,
            stress: groups.stress.length ? groups.stress.reduce((a, b) => a + b, 0) / groups.stress.length : 0,
        }));
}

export function getFieldComparisonData(fields: FieldData[], pixelValues: PixelValueData[]): FieldComparisonItem[] {
    const keys = ["water", "nitrogen", "phosphorus", "stress"] as const;
    return fields.map(f => {
        const fv = pixelValues.filter(p => p.fieldId === f.id);
        const latest: Record<string, number> = {};
        types.forEach((type, i) => {
            const matches = fv.filter(p => p.imageType === type && p.value !== null);
            matches.sort((a, b) => new Date(b.imageDate).getTime() - new Date(a.imageDate).getTime());
            latest[keys[i]] = matches[0]?.value ?? 0;
        });
        return { field: f.name, water: latest.water, nitrogen: latest.nitrogen, phosphorus: latest.phosphorus, stress: latest.stress };
    });
}

export function getCropDistributionData(crops: CropData[]): CropDistributionItem[] {
    const counts: Record<string, number> = {};
    crops.forEach(c => { counts[c.name] = (counts[c.name] || 0) + 1; });
    const colors = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#8b5cf6"];
    return Object.entries(counts).map(([name, count], i) => ({ name, count, fill: colors[i % colors.length] }));
}

export function getFreshnessData(fields: FieldData[]): FreshnessItem[] {
    return fields.map(f => {
        const dates = f.imagesDates.filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const latestDateStr = dates[0];
        if (!latestDateStr) return { name: f.name, latestDate: "No data", daysSince: 999, status: "Stale" as const };
        const daysSince = Math.floor((Date.now() - new Date(latestDateStr).getTime()) / (24 * 60 * 60 * 1000));
        const status = daysSince <= 7 ? "Recent" as const : daysSince <= 30 ? "Normal" as const : "Stale" as const;
        return { name: f.name, latestDate: getDateShort(new Date(latestDateStr)), daysSince, status };
    });
}
