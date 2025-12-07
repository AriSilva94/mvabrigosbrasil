import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AppImageProvider from "@/components/providers/AppImageProvider";
import ToastProvider from "@/components/providers/ToastProvider";

const geistSans = localFont({
  variable: "--font-geist-sans",
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
  title: "Medicina de Abrigos Brasil - Infodados de Abrigos de Animais",
  description:
    "Plataforma nacional de mapeamento de abrigos brasileiros de animais e estatísticas populacionais.",
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
            <Header />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </AppImageProvider>
      </body>
    </html>
  );
}
