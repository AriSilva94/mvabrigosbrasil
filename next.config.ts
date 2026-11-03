import type { NextConfig } from "next";


if (process.env.NEXT_TURBOPACK_USE_WORKER === undefined) {
  process.env.NEXT_TURBOPACK_USE_WORKER = "0";
}

// O helmet só cobre as respostas da API; as páginas (login, redefinição de
// senha) vêm do Next. Sem CSP completa: GTM/GA e embeds do YouTube exigiriam
// uma lista de origens a manter; frame-ancestors já impede clickjacking.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // O link de redefinição leva o token na URL: nunca enviá-lo a outra origem.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},

  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },

  async rewrites() {
    const origin = (
      process.env.INTERNAL_API_URL ?? "http://localhost:3001"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${origin}/api/v1/:path*`,
      },
    ];
  },

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
