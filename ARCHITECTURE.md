# ARCHITECTURE.md (next-app)

## System Overview

Geo_Harvest is a server-first Next.js app that turns Sentinel-2 satellite imagery into per-field vegetation/index maps and aggregates. Users draw field boundaries, assign a crop/variety/planting date, and the system fetches recent cloud-filtered imagery, generates 4 index overlays (Water Requirement/NDMI, Nitrogen/NDRE, Phosphorus/CIre, Crop Stress/NDVI) via evalscripts, encodes as WebP, uploads to Supabase Storage, computes area-averaged values, and stores them for charting/comparison.

## Core Entities (Data Model)

From `db/schema.ts`:
- **user** (auth-schema) - Better-Auth user
- **field** - `id` (uuid), `name`, `coordinates` (Postgres `polygon`), `ownerId` FK->user (cascade), `imagesDates` (text[]), timestamps. Indexed on id/ownerId.
- **crop** - `id`, `name` (enum from `data/crop`), `seedVariety`, `fieldId` FK->field (cascade), `planted_at`, timestamps. One crop per field context (relations defined).
- **avgPixelValue** - `id`, `fieldId` FK->field (cascade), `imageType` enum (`waterRequirement|nitrogenRequirement|phosphorusRequirement|cropStress`), `imageDate` (text), `value` (real), timestamps. Unique index on (`fieldId`, `imageType`, `imageDate`).

Relations: `field` has many `crop` and many `avgPixelValue`; `crop`/`avgPixelValue` belong to `field`.

## Authentication & Authorization

- **Better-Auth** configured in `app/lib/auth.ts` with Drizzle adapter (pg). Email/password enabled with password reset email via `app/utils/email.ts`. Google OAuth supported.
- **Session**: Retrieved server-side via `auth.api.getSession({ headers: await headers() })`.
- **Authorization**:
  - Field creation: requires session. Max 3 fields per user unless `session.user.id === process.env.ADMIN_USER_ID` (`userAllowedToCreateField` in `app/actions/field.ts`).
  - Field deletion: requires session; only `ownerId` can delete.
  - All mutations go through Server Actions/API routes with server-side checks.

## Field Creation Flow

`CreateField` (`app/actions/field.ts`):
1. Validate session and field limit.
2. Insert `field` with polygon from coordinates (converted via `toPostgresPolygon` to `((x,y),...)`).
3. Insert `crop` (name/variety/planted_at).
4. Call `sentinel_catalog({coordinates})` (coordinates passed as-is from client; catalog expects polygon in [lng,lat] order? See below). Get sorted dates desc.
5. If no dates -> return `{data:{id}}` (field created, no imagery yet).
6. For each of `FIELD_IMAGE_TYPES` in order:
   - Call `sentinel_image({coordinates, date: dates[0], imageType, crop: fcrop.name, plantingDate: fcrop.plantedDate})`
   - Encode with `encodeFieldImage()` (must be 512x512 PNG with alpha channel; converted to lossless WebP)
   - Upload to Supabase bucket `field` at `fieldImagePath(fieldId, date, imageType)` with cache headers, upsert true
   - Compute color ramp via `getColorRamp(crop, imageType, plantingDate, new Date(date))`, convert stops to RGB
   - Compute average via `getAverageRampValueFromBuffer(res.data, imageType, rampRGB)` and collect
7. **All-or-nothing**: if any step fails, delete uploaded partials from Supabase and return error (do not append date / do not insert pixel values).
8. On success: append date to `field.imagesDates` via `array_append`, insert all `avgPixelValue` rows (upsert on conflict key).

## Scheduled Updates (Cron)

`GET /api/cronjob/newImags/route.ts` (protected by `Authorization: Bearer ${CRON_SECRET}`, runs weekly per `vercel.json`):
1. Load all fields with coordinates, `imagesDates`, and related crop (name, planted_at).
2. For each field:
   - Convert polygon from Postgres format via `fromPostgresPolygon`, remap coordinates to `[lng, lat]` for Sentinel calls (`coor.map(c => [c[1],c[0]])`).
   - Call `sentinel_catalog` to get latest dates; skip if already in `imagesDates`.
   - For each image type: fetch via `sentinel_image`, encode to WebP, upload to Supabase. Track uploaded paths.
   - Compute pixel averages per image.
   - **All-or-nothing**: only if all 4 uploaded successfully (`uploadedPaths.length === 4`), append date to `imagesDates` and insert pixel values. Otherwise delete partials and log errors.

## Satellite Integration

**Auth token** (`app/utils/sentinel.ts#getToken`): POST to Copernicus CDSE token endpoint with client credentials; returns access token. Errors bubble as generic backend errors in callers.

**Catalog** (`sentinel_catalog`):
- Builds GeoJSON Polygon from coordinates
- Tries cloud cover thresholds `[5,10,15,20]` in order, returns first result with `features.length > 0`
- Defaults to last 7 days if not specified
- Endpoint: `https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search` (CQL2 JSON)

**Process/Imagery** (`sentinel_image`):
- Builds Process API request to `https://sh.dataspace.copernicus.eu/api/v1/process`
- Input: Sentinel-2 L2A, time range = single date, geometry polygon
- Output: 512x512 PNG, 4 bands RGBA (`default`), plus `index`, `eobrowserStats`, `dataMask` outputs
- Evalscript from `app/utils/Script.ts` selected by `imageType`, with crop/stage-aware color ramp from `getColorRamp`
- Returns raw PNG bytes (Uint8Array)

**Coordinate handling**: Create flow passes coordinates as-is from client to catalog/image. Cron flow reads Postgres polygon and remaps `[[y,x],...]` -> `[[x,y],...]` for Sentinel API. Be aware of coordinate order differences between systems.

## Image Generation & Processing

**Evalscripts** (`app/utils/Script.ts`):
- Common cloud mask (`isCloud`) based on SCL classes
- `waterRequirement` (NDMI): `(index(B8A,B11)+1)/2` -> 0..1, masked by dataMask
- `nitrogenRequirement` (NDRE): `(B08-B05)/(B08+B05)`
- `phosphorusRequirement` (CIre): `(B07/B05)-1`
- `cropStress` (NDVI): `((B08-B04)/(B08+B04)+1)/2` -> 0..1
- Each script returns RGBA visualization via `ColorRampVisualizer`, plus index/stats/mask outputs

**Color Ramps** (`app/utils/colorRamp.tsx`):
- Crop- and growth-stage aware using `agriCycle.ts` (days after planting -> stage). Supports wheat/rice/cotton/generic stages.
- Different thresholds/ranges per crop and stage. Universal NDMI ramp used as base for water requirement.
- Returns array of `[value, hexColor]` stops consumed by evalscript and by pixel averaging.

**Encoding** (`app/utils/fieldImageEncode.ts`): Validates PNG has alpha channel and is 512x512, converts to lossless WebP via sharp. Images stored as `.webp`.

**Averaging** (`app/actions/actions.ts` exports `getAverageRampValueFromBuffer`): Reads processed image data and computes average value mapped to ramp scale (implementation details in actions.ts). Used for time series/charts.

## Routing & UI

**Route groups**:
- `app/app/(dashboard)/` - Main app with sidebar/navbar layout. Pages: `page.tsx` (Farm at a Glance), `fields/page.tsx`, `analytics/page.tsx`. Components under each route.
- `app/app/(detail)/` - Full-screen layout. `fields/[id]/page.tsx` (field detail with map/charts/config), `fields/create/page.tsx` (draw boundaries + form).
- `app/app/auth/` - Authentication UI
- `app/api/` - Route handlers

**Key components**: Map views (MapClient variants), charts (Recharts), FieldCard, Config/switchers, analytics components (cropDistribution, fieldComparison, overviewChart, dataFreshnessTable).

## Business Logic Summary

1. **Field management**: Users own fields; creation limited; deletion cascades to crops/avg values and cleans up Supabase images.
2. **Imagery lifecycle**: On creation fetch latest available date (cloud-filtered), generate all 4 indices, compute averages, persist. Cron fetches newer dates weekly for existing fields, only updating if complete set available (all-or-nothing).
3. **Crop-aware visualization**: Indices and color ramps adapt to crop type and growth stage (days after planting). Different proxies used per nutrient (NDRE for N, CIre for P).
4. **Data quality**: Cloud masking via SCL, fallback to higher cloud thresholds in catalog search, all-or-nothing prevents partial/broken states, validation on image dimensions/alpha.
5. **Performance/ops**: Images cached long-term (31536000s), served from Supabase public bucket, Vercel cron for updates.

## Integration Points

- **Neon**: Postgres via `@neondatabase/serverless` HTTP driver
- **Supabase**: Storage bucket `field` (public access for images)
- **Copernicus CDSE**: Identity + Process + Catalog APIs
- **Better-Auth**: Auth/session management
- **Vercel**: Cron configuration, hosting
