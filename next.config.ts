import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Security: Limit request body size to prevent DoS attacks
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;

