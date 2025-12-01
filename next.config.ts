import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Add your config options here

  // Allow these hosts to access your dev server (for the warning you saw)
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
  ],

  // You can still add other options normally, e.g.:
  // reactStrictMode: true,
  // eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
