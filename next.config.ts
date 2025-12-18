import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker standalone output
  output: 'standalone',

  // Subpath deployment (thmm.kr/eng-sparkling)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Asset prefix for CDN/subpath
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;
