/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rvlckawhgmfsxfjlsfpo.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;