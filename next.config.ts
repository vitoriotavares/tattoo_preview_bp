import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for image uploads (camera photos can be large)
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // Support high-resolution camera photos
    },
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
