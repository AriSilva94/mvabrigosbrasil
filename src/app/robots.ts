import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const PRIVATE_PATHS = [
  "/api/",
  "/painel",
  "/vagas",
  "/minhas-vagas",
  "/voluntarios",
  "/admin",
  "/equipe",
  "/meu-cadastro",
  "/dinamica-populacional",
  "/login",
  "/register",
  "/recuperar-senha",
  "/redefinir-senha",
  "/alterar-senha",
  "/treinamentos",
  "/conteudos-exclusivos",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
