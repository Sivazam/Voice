import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking
  },
  reactStrictMode: true, // Enable React strict mode for better development experience
  // ESLint configuration is now handled separately in Next.js 16
};

export default nextConfig;
