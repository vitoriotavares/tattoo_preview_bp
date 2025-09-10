import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizations for production
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Images configuration for Sharp in production
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleapis.com',
      },
    ],
  },
  // API routes timeout
  async rewrites() {
    return [];
  },
};

export default nextConfig;
