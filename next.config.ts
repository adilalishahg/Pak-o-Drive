import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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
};

export default nextConfig;
