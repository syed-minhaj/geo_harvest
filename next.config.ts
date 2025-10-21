import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/app/fields',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
