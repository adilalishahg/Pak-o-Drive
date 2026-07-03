import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    inlineCss: true,
    optimizePackageImports: ['canvas-confetti'],
  },
  images: {
    // Auto-serve WebP/AVIF to supported browsers — no raw JPEG/PNG hits mobile
    formats: ["image/avif", "image/webp"],

    // Breakpoints that match our responsive grid (mobile-first for PK 3G/4G)
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],

    // Cache optimised images for 30 days on CDN edge nodes
    minimumCacheTTL: 2592000,

    // Serve at 75 quality — sharp enough for product images, ~40% smaller than default 85
    dangerouslyAllowSVG: false,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Allow all Cloudinary paths (any account/folder structure)
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com data:; img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; upgrade-insecure-requests;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
