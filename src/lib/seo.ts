import type { Metadata } from "next";

const siteName = "Medicina de Abrigos Brasil";
const defaultDescription =
  "Plataforma nacional de mapeamento de abrigos de animais, transparência de dados e conteúdos técnicos.";
const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: siteName,
};
const defaultTwitterImage = "/twitter-image";

export const siteDisplayName = siteName;
export const defaultSiteDescription = defaultDescription;

type BuildMetadataParams = {
  title: string;
  description?: string;
  canonical?: string;
  image?:
    | string
    | {
        url: string;
        alt?: string;
        width?: number;
        height?: number;
      };
};

export function buildMetadata({
  title,
  description = defaultDescription,
  canonical = "/",
  image,
}: BuildMetadataParams): Metadata {
  const fullTitle = title === siteName ? siteName : `${title} | ${siteName}`;
  const ogImage =
    typeof image === "string"
      ? { ...defaultOgImage, url: image }
      : image
        ? { ...defaultOgImage, ...image }
        : defaultOgImage;
  const twitterImage = ogImage?.url ?? defaultTwitterImage;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      type: "website",
      siteName,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [twitterImage],
    },
  };
}
