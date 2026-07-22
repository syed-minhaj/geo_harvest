import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental:{
    serverActions : {
        bodySizeLimit : "10mb"
    }
  },
   logging: {
    browserToTerminal: false,
  },
};

export default nextConfig;
