import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
