import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rvlckawhgmfsxfjlsfpo.supabase.co",
      },
    ],
  },
};

export default nextConfig;