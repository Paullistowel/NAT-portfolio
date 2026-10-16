import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description = `${site.name} — ${site.roles.join(", ")}. ${site.intro}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.title} — ${site.roles.join(" | ")}`, template: `%s — ${site.title}` },
  description,
  keywords: ["3D modeling", "CAD design", "SolidWorks", "engineering visualization", "product design", "portfolio"],
  openGraph: {
    type: "website",
    title: site.title,
    description,
    siteName: site.title,
    images: [{ url: "/images/projects/phototherapy-unit/render-tray-lamp.jpg", width: 990, height: 775, alt: "Rendered phototherapy unit" }],
  },
  twitter: { card: "summary_large_image", title: site.title, description },
};

export const viewport: Viewport = { themeColor: "#0a0b0c", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available so entrance animations can start hidden without hiding content for no-JS visitors. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
