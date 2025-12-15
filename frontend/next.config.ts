import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Disable static optimization for pages that need dynamic data
  experimental: {
    dynamicIO: true,
  },
};

export default nextConfig;
