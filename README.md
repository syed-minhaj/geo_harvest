# Geo_Harvest

Geo_Harvest is a web application built with Next.js for agricultural data visualization and management. It allows users to view and analyze data related to their fields, including information fetched from third-party APIs.

## Functionality

*   **Field Visualization:** Visualize geographic data for agricultural fields on a map.
*   **Data Integration:** Fetches and displays data from external sources, including satellite imagery and other agricultural data, using third-party APIs.
*   **Cron Jobs:** Automatically updates data, such as fetching new images, on a regular schedule.
*   **Authentication:** Secure user authentication and authorization.

## Getting Started

To get a local copy up and running, follow these simple steps.


### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/syed-minhaj/geo_harvest.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Run the development server
    ```sh
    npm run dev
    ```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

*   [Next.js](https://nextjs.org/) - React Framework
*   [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types.
*   [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for SQL databases
*   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework

## Project Structure

The project structure is based on the Next.js `app` directory.

```
.
├── app
│   ├── api         # API routes
|   ├── actions     # server actions
│   ├── app         # Application pages
│   ├── components  # Reusable components
│   ├── lib         # Library function (supabase)
|   ├── utils       # utility functions
|   ├── hooks       # custom hooks
│   └── style       # Global styles
├── db              # Database schema
├── public          # Static assets
└── ...
```
