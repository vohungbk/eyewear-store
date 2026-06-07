import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { hostname: "*.supabase.co" },
      { hostname: "*.supabase.in" },
    ],
  },
};

export default nextConfig;
