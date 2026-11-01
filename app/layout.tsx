import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OpenComputerScience — Ciencias de la Computación",
    template: "%s · OpenComputerScience",
  },
  description:
    "La carrera de Ciencias de la Computación, clase por clase. Abierta, gratuita y sin inscripción.",
  applicationName: "OpenComputerScience",
  authors: [{ name: "OpenComputerScience" }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "OpenComputerScience",
    title: "OpenComputerScience — Ciencias de la Computación",
    description:
      "La carrera de Ciencias de la Computación, clase por clase. Abierta, gratuita y sin inscripción.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e100f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${interTight.variable} ${jetBrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-cream">
        {children}
      </body>
    </html>
  );
}
