import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking
  },
  reactStrictMode: true, // Enable React strict mode for better development experience
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds
  },
};

export default nextConfig;
