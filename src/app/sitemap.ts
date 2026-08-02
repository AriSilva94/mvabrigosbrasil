import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { libraryItems } from "@/data/libraryItems";
import { MATERIAS_ITEMS } from "@/constants/materias";
import { REPORTS } from "@/constants/reports";

const BR_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

function parseBrDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const match = value.match(BR_DATE_PATTERN);
  if (!match) return undefined;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/biblioteca", priority: 0.8, changeFrequency: "weekly" },
  { path: "/materias", priority: 0.8, changeFrequency: "weekly" },
  { path: "/relatorios", priority: 0.8, changeFrequency: "weekly" },
  { path: "/banco-de-dados", priority: 0.8, changeFrequency: "weekly" },
  { path: "/programa-de-voluntarios", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contato", priority: 0.6, changeFrequency: "monthly" },
  { path: "/equipe-mv", priority: 0.6, changeFrequency: "monthly" },
  { path: "/medicina-de-abrigos", priority: 0.6, changeFrequency: "monthly" },
  { path: "/parceiros", priority: 0.6, changeFrequency: "monthly" },
  { path: "/quem-somos", priority: 0.6, changeFrequency: "monthly" },
  { path: "/compromisso", priority: 0.6, changeFrequency: "monthly" },
  { path: "/compromisso-privacidade", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contrato-para-dados-de-abrigo", priority: 0.6, changeFrequency: "monthly" },
  { path: "/politica-de-cookies", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contrato-de-uso-de-dados", priority: 0.6, changeFrequency: "monthly" },
  { path: "/politica-de-privacidade", priority: 0.6, changeFrequency: "monthly" },
  { path: "/termos-de-uso", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    priority: route.priority,
    changeFrequency: route.changeFrequency,
  }));

  const libraryEntries: MetadataRoute.Sitemap = libraryItems.map((item) => {
    const lastModified = parseBrDate(item.publishedAt);
    return {
      url: `${siteUrl}/biblioteca/${item.slug}`,
      priority: 0.5,
      changeFrequency: "monthly",
      ...(lastModified ? { lastModified } : {}),
    };
  });

  const clippingEntries: MetadataRoute.Sitemap = MATERIAS_ITEMS.map((item) => {
    const lastModified = parseBrDate(item.publishedAt);
    return {
      url: `${siteUrl}${item.href}`,
      priority: 0.5,
      changeFrequency: "monthly",
      ...(lastModified ? { lastModified } : {}),
    };
  });

  const reportEntries: MetadataRoute.Sitemap = REPORTS.map((item) => {
    const lastModified = parseBrDate(item.publishedAt);
    return {
      url: `${siteUrl}/relatorios/${item.slug}`,
      priority: 0.5,
      changeFrequency: "monthly",
      ...(lastModified ? { lastModified } : {}),
    };
  });

  return [...staticEntries, ...libraryEntries, ...clippingEntries, ...reportEntries];
}
