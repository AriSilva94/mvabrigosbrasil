import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AppImageProvider from "@/components/providers/AppImageProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import { TourProvider } from "@/components/tour/TourProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const geistSans = localFont({
  variable: "--font-geist-sans",
  display: "swap",
  src: [
    {
      path: "./fonts/geist-sans/Geist-100.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/geist-sans/Geist-200.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/geist-sans/Geist-300.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/geist-sans/Geist-400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/geist-sans/Geist-500.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/geist-sans/Geist-600.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/geist-sans/Geist-700.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/geist-sans/Geist-800.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/geist-sans/Geist-900.ttf",
      weight: "900",
      style: "normal",
    },
  ],
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  display: "swap",
  src: [
    {
      path: "./fonts/geist-mono/GeistMono-100.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/geist-mono/GeistMono-200.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/geist-mono/GeistMono-300.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/geist-mono/GeistMono-400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/geist-mono/GeistMono-500.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/geist-mono/GeistMono-600.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/geist-mono/GeistMono-700.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/geist-mono/GeistMono-800.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/geist-mono/GeistMono-900.ttf",
      weight: "900",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Medicina de Abrigos Brasil",
    template: "%s | Medicina de Abrigos Brasil",
  },
  description:
    "Plataforma nacional de mapeamento de abrigos de animais, dados populacionais e apoio técnico para quem cuida de cães e gatos.",
  openGraph: {
    type: "website",
    siteName: "Medicina de Abrigos Brasil",
    title: "Medicina de Abrigos Brasil",
    description:
      "Mapa nacional de abrigos, transparência de dados e conteúdos técnicos sobre medicina de abrigos.",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Medicina de Abrigos Brasil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medicina de Abrigos Brasil",
    description:
      "Mapa nacional de abrigos, transparência de dados e conteúdos técnicos sobre medicina de abrigos.",
    images: ["/twitter-image"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/fav.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppImageProvider>
          <ToastProvider>
            <TourProvider>
              <Header />
              <main>{children}</main>
              <Analytics />
              <Footer />
            </TourProvider>
            <SpeedInsights />
          </ToastProvider>
        </AppImageProvider>
      </body>
    </html>
  );
}
