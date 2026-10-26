# AGENT.md (next-app)

## Overview
This is the Next.js 16 application for Geo_Harvest - a precision agriculture web app that integrates Sentinel-2 satellite imagery to monitor field health (water requirement/NDMI, nitrogen/NDRE, phosphorus/CIre, crop stress/NDVI). Uses App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui.

## Tech Stack
- **Framework**: Next.js 16.2.6, React 19.2.4, TypeScript 5.9
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix UI primitives, Lucide icons
- **Maps**: Leaflet, react-leaflet, @geoman-io/leaflet-geoman-free / leaflet-draw
- **Charts**: Recharts 2.15
- **Auth**: Better-Auth with @daveyplate/better-auth-ui, Google OAuth support
- **DB**: PostgreSQL (Neon) via @neondatabase/serverless + Drizzle ORM
- **Storage**: Supabase (public bucket `field` for satellite overlay images)
- **Satellite**: Copernicus Data Space Ecosystem API (Sentinel-2 L2A)
- **Image processing**: sharp (WebP encoding), GeoTIFF/geotiff
- **Utilities**: sonner (toasts), next-themes, nextjs-toploader

## Quick Commands
From `next-app/`:
```bash
pnpm dev      # Dev server with Turbopack
pnpm build    # drizzle generate+push + next build
pnpm start    # Production server
pnpm lint     # Next.js lint
pnpm drizzle  # drizzle-kit generate && drizzle-kit migrate
```

## Environment Variables (required)
See `.env.example`. Key vars:
- `DATABASE_URL` (Neon Postgres)
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
- `COPERNICUS_CLIENT_ID`, `COPERNICUS_CLIENT_SECRET`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_URL`)
- `APP_PASSWORD` (Gmail app password for emails)
- `CRON_SECRET` (for `/api/cronjob/newImags`)
- `ADMIN_USER_ID` (optional, bypasses field creation limit)

## Project Structure
```
next-app/
├── app/
│   ├── actions/           # Server Actions (field.ts, actions.ts, graphValues.ts)
│   ├── api/               # Route handlers (auth/[...all], cronjob/newImags, test/*)
│   ├── app/               # Protected app routes
│   │   ├── (dashboard)/   # Layout with sidebar/navbar (/, /fields, /analytics)
│   │   ├── (detail)/      # Full-screen layout (/fields/[id], /fields/create)
│   │   └── auth/          # Auth pages
│   ├── components/        # Shared components (navbar, sidebar, FieldCard, MapOverview, ui/*)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Config (auth.ts, drizzle.ts, supabase.ts, utils.ts)
│   ├── style/             # Global styles
│   └── utils/             # Business logic/utilities (sentinel, Script/evalscripts, colorRamp, fieldImage*, agriCycle, area, etc.)
├── db/                    # Drizzle schema (schema.ts, auth-schema.ts)
├── drizzle/               # Migrations
├── data/                  # Crop definitions, color palettes
├── public/                # Static assets
└── scripts/               # Utility scripts
```

## Conventions
- **App Router**: Use Server Components by default; mark client components with `"use client"`. Server Actions live in `app/actions/`.
- **Auth**: Use Better-Auth via `app/lib/auth.ts`. Get session with `auth.api.getSession({ headers: await headers() })` in server code.
- **DB**: Drizzle ORM with schema in `db/schema.ts`. Connection via `app/lib/drizzle.ts` (Neon HTTP). Migrations via `pnpm drizzle`.
- **Validation**: Treat all client input as untrusted. TypeScript types are not runtime validation. Enforce authz/ownership on server.
- **Imports**: Path aliases via `tsconfig.json` (commonly `@/...`).
- **UI**: shadcn/ui components in `app/components/ui/`. Follow existing patterns.
- **Security**: Never trust client-supplied roles/permissions/ownership/amounts. All business rules enforced server-side.
- **Errors**: Server actions return `{ err: string | null, data?: T }` pattern in many places.
- **Images**: Field overlay images stored as WebP in Supabase bucket `field` at `{fieldId}/{date}/{imageType}.webp`. Use helpers from `app/utils/fieldImage.ts`.
- **Types**: Shared types in `app/types.d.ts`; DB types inferred via Drizzle.

## Notes
- Cron job at `/api/cronjob/newImags` runs weekly (Vercel) - requires `Authorization: Bearer ${CRON_SECRET}`.
- Field creation is rate-limited (max 3 fields per user) unless `ADMIN_USER_ID` matches.
- All-or-nothing image processing: on create/update, if any of the 4 image types fails, partial uploads are cleaned up and date not recorded.
- Satellite imagery fetched from Copernicus CDSE; tokens cached implicitly per request flow. Catalog tries multiple cloud cover thresholds (5,10,15,20).
- Color ramps and evalscripts are crop- and growth-stage aware (computed from planting date).
