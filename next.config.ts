import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [50, 75, 85, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mvabrigosbrasil.com.br",
      },
    ],
  },
};

export default nextConfig;
