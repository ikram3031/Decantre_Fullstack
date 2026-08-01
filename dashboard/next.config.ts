import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  output: "standalone",
  typedRoutes: true,
};

export default nextConfig;
