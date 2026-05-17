import type { NextConfig } from "next";


if (process.env.NEXT_TURBOPACK_USE_WORKER === undefined) {
  process.env.NEXT_TURBOPACK_USE_WORKER = "0";
}

const nextConfig: NextConfig = {
  turbopack: {},

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false;
    }
    return config;
  },
  images: {
    qualities: [50, 75, 85, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mvabrigosbrasil.com.br",
      },
      {
        protocol: "https",
        hostname: "www.mvabrigosbrasil.com.br",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
