/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // next/image serves the heavy PNGs (portrait, logo, trust photo) as AVIF, or WebP where AVIF isn't supported.
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
