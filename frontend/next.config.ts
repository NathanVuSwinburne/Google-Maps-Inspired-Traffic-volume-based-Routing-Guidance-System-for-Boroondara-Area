import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Mapbox GL requires transpilation for some environments
  transpilePackages: ["mapbox-gl"],
};

export default nextConfig;
