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
  experimental:{
    serverActions : {
        bodySizeLimit : "10mb"
    }
  }
};

export default nextConfig;
