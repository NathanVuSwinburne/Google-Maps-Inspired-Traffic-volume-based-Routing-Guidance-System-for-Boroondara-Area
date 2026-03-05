/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mapbox GL requires transpilation for some environments
  transpilePackages: ["mapbox-gl"],
};

module.exports = nextConfig;
