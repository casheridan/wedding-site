import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { getSiteContent } from "@/lib/content";

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: {
      default: `${site.coupleNames} · Wedding`,
      template: `%s · ${site.coupleNames}`,
    },
    description: `Join us to celebrate the wedding of ${site.coupleNames} — ${site.weddingDateDisplay}.`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory font-body text-ink">
        {children}
      </body>
    </html>
  );
}
