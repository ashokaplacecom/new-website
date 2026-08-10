import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // Fixes the 10MB request body size limit for API routes
    proxyClientMaxBodySize: '50mb',
  },
};

export default nextConfig;
