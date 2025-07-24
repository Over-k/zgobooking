import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Note: The 'turbo' config is deprecated in Next.js 15+
    // Move Turbopack settings to the root level when needed
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Add image optimization settings to help with timeouts
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // These settings can help with timeout issues
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Add domains as fallback (some versions prefer this)
    domains: ['res.cloudinary.com'],
  },

  // Add general timeout settings
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;