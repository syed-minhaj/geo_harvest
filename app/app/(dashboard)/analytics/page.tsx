import { Suspense } from "react";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { db } from "@/app/lib/drizzle";
import { field, crop, avgPixelValue } from "@/db/schema";
import { eq, inArray, or } from "drizzle-orm";
import { Info } from "./components/info";
import { OverviewChart } from "./components/overviewChart";
import { FieldComparison } from "./components/fieldComparison";
import { CropDistribution } from "./components/cropDistribution";
import { DataFreshnessTable } from "./components/dataFreshnessTable";
import { computeKPIs, getOverviewData, getFieldComparisonData, getCropDistributionData, getFreshnessData } from "./lib/analytics";
import AnalyticsSkeleton from "./components/AnalyticsSkeleton";

const defaultFieldIds = ["06402424-72fa-4b52-8d2f-6bd81c56c2bf", "9eee4301-3096-4d44-9542-8c31dccb520d"];

const defaultFields = await db.select().from(field).where(
    or(eq(field.id, defaultFieldIds[0]), eq(field.id, defaultFieldIds[1]))
);

async function Main() {
    const session = await auth.api.getSession({ headers: await headers() });

    const fields = session
        ? await db.select().from(field).where(eq(field.ownerId, session.user.id))
        : defaultFields;
    if (!fields.length) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-2">
                <p className="text-lg font-medium">No fields found</p>
                <p className="text-sm opacity-66">Create a field to see analytics</p>
            </div>
        )
    }

    const fieldIds = fields.map(f => f.id);
    const crops = await db.select().from(crop).where(inArray(crop.fieldId, fieldIds));
    const pixelValues = await db.select().from(avgPixelValue).where(inArray(avgPixelValue.fieldId, fieldIds));

    const kpi = computeKPIs(fields, crops, pixelValues);
    const overviewData = getOverviewData(pixelValues);
    const fieldComparisonData = getFieldComparisonData(fields, pixelValues);
    const cropData = getCropDistributionData(crops);
    const freshnessData = getFreshnessData(fields);

    return (
        <div className="flex flex-col gap-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Info heading="Total Fields" value={kpi.totalFields.toString()} />
                <Info heading="Active Crops" value={kpi.activeCrops.toString()} />
                <Info heading="Data Points" value={kpi.totalDataPoints.toLocaleString()} />
                <Info heading="Latest Data" value={kpi.latestData} />
                <Info heading="Recent Fields (30d)" value={kpi.recentFields.toString()} />
                <Info heading="Avg Field Health" value={(kpi.avgHealth * 100).toFixed(1) + "%"} />
                <Info heading="Best Field" value={kpi.bestField} />
                <Info heading="Data Coverage" value={kpi.coverage + "%"} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OverviewChart data={overviewData} />
                <FieldComparison data={fieldComparisonData} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CropDistribution data={cropData} />
                <DataFreshnessTable data={freshnessData} />
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col gap-4 w-full px-4 overflow-x-hidden">
            <div className="flex flex-row items-center mt-4">
                <h1 className="text-xl font-semibold">Analytics</h1>
            </div>
            <Suspense fallback={<AnalyticsSkeleton />}>
                <Main />
            </Suspense>
        </div>
    )
}
