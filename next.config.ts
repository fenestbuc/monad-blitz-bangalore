import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.resolve.fallback = { "porto/internal": false, "accounts": false };
    return config;
  },
  turbopack: {}
};

export default nextConfig;
