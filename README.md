# Geo_Harvest

Geo_Harvest is a precision agriculture web application built with Next.js that integrates satellite imagery from Copernicus Sentinel-2 to help farmers monitor field health indicators — water requirement (NDMI), nitrogen, phosphorus, and crop stress — through an interactive map interface.

## Features

- **Interactive Field Maps** – Draw field boundaries on a Leaflet map and visualize satellite-derived indices as color-ramped overlays
- **Multi-Spectral Analysis** – Four analysis types: Water Requirement (NDMI), Nitrogen, Phosphorus, and Crop Stress
- **Satellite Data Pipeline** – Automatic fetching of Sentinel-2 imagery via Copernicus Data Space Ecosystem API, processed with custom evalscripts
- **Crop Management** – Supports wheat, rice, and cotton with variety selection and growth stage tracking
- **Farm at a Glance Dashboard** – Overview map, KPI cards, recent field activity, and field health table at `/app`
- **Analytics Dashboard** – Cross-field KPIs, vegetation index trends, field comparison bar chart, crop distribution donut, and data freshness tracking at `/app/analytics`
- **Scheduled Updates** – Weekly cron job (Vercel Cron) updates imagery automatically
- **Authentication** – Secure login via email/password or Google OAuth using Better-Auth
- **Dark Mode** – Full theme support with next-themes
- **Responsive Design** – Mobile bottom navigation, desktop sidebar, and adaptive layouts
- **PWA Support** – Progressive Web App with standalone display mode

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router) with TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4, shadcn/ui, Radix UI, Lucide Icons
- **Database:** PostgreSQL ([Neon](https://neon.tech/)) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Better-Auth](https://www.better-auth.com/) with email/password + Google OAuth
- **Mapping:** [Leaflet](https://leafletjs.com/) + react-leaflet, Leaflet Draw / Geoman
- **Charts:** [Recharts](https://recharts.org/)
- **Storage:** [Supabase](https://supabase.com/) (file storage for satellite overlays)
- **Satellite API:** [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/) (Sentinel-2)
- **Image Processing:** [sharp](https://sharp.pixelplumbing.com/) + GeoTIFF
- **DevOps:** Docker, Vercel (Cron Jobs), pnpm workspaces

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL database (Neon or local)
- Supabase project (for file storage)
- Copernicus Data Space Ecosystem account (free)
- Google OAuth credentials (optional)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/syed-minhaj/geo_harvest.git
cd geo_harvest/next-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `BETTER_AUTH_SECRET` | Better-Auth encryption secret |
| `BETTER_AUTH_URL` | Base URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `COPERNICUS_CLIENT_ID` | Copernicus Data Space Ecosystem client ID |
| `COPERNICUS_CLIENT_SECRET` | Copernicus Data Space Ecosystem client secret |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `APP_PASSWORD` | Gmail app password (for password reset emails) |
| `CRON_SECRET` | Secret to secure the cron endpoint |

### 4. Push the database schema

```bash
pnpm drizzle
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
next-app/
├── app/
│   ├── actions/           # Server Actions (revalidation, field CRUD, graph data)
│   ├── api/               # API routes (auth, cron, test)
│   ├── app/               # Authenticated app pages
│   │   ├── (dashboard)/   # Dashboard layout (sidebar + navbar)
│   │   │   ├── page.tsx   # Farm at a Glance dashboard (map, KPIs, field cards, table)
│   │   │   ├── fields/    # Field list page (header + create button + field cards)
│   │   │   └── analytics/ # Cross-field analytics (KPIs, charts, crop distribution, freshness)
│   │   ├── (detail)/      # Detail layout (full-screen)
│   │   │   └── fields/
│   │   │       ├── [id]/  # Field detail (map, charts, analysis config)
│   │   │       └── create/# Draw boundaries + create field form
│   │   └── auth/          # Authentication pages
│   ├── components/        # Shared UI components (navbar, sidebar, FieldCard, MapOverview)
│   │   └── ui/            # shadcn/ui primitives (button, card, chart, dialog, select, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Library configs (auth, drizzle, supabase, utils)
│   ├── style/             # Global styles (map, theme toggle)
│   └── utils/             # Utilities (evalscripts, area calc, dates, color ramps, sentinel API)
├── db/                    # Database schema (auth + app tables)
├── drizzle/               # SQL migration files
├── public/                # Static assets
└── data/                  # Crop data, color palettes
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Run migrations + build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Next.js lint |
| `pnpm drizzle` | Generate + apply database migrations |

## Data Flow

```
Copernicus Sentinel-2 API
        │
        ▼
  Server Actions / Cron Job
        │
        ▼
  [sharp] Process evalscript → PNG
        │
        ▼
  Supabase Storage (image overlays)
        │
        ▼
  Avg pixel values → PostgreSQL (Neon)
        │
        ▼
  Next.js App → Leaflet Map + Recharts
```

## Deployment

The app is designed to be deployed on [Vercel](https://vercel.com/). The `vercel.json` includes a cron job configuration that triggers the imagery update endpoint weekly.

A Dockerfile and `docker-compose.yml` are also provided for containerized deployment.
