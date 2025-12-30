import type { NextConfig } from "next";

// Turbopack workers tentam abrir sockets locais; em ambientes restritos
// isso dispara EPERM. Forçamos o modo in-process para manter o bundle.
if (process.env.NEXT_TURBOPACK_USE_WORKER === undefined) {
  process.env.NEXT_TURBOPACK_USE_WORKER = "0";
}

const nextConfig: NextConfig = {
  turbopack: {},
  // Suprimir avisos de source map em desenvolvimento
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
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
