import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AmbientBackground } from "@/components/AmbientBackground";
import { AnchorScroll } from "@/components/AnchorScroll";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { site } from "@/content/site";
import { themeInitScript } from "@/lib/theme-script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description = `${site.fullName} (${site.name}) — ${site.professionalTitle}. ${site.intro}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.title} — ${site.roles.join(" | ")}`, template: `%s — ${site.title}` },
  authors: [{ name: site.fullName }],
  description,
  keywords: ["3D modeling", "CAD design", "SolidWorks", "Siemens NX", "engineering visualization", "product design", "biomedical engineering", "portfolio", site.fullName],
  openGraph: {
    type: "website",
    title: site.title,
    description,
    siteName: site.title,
    images: [{ url: "/images/projects/bearing-housing/exploded-assembly.jpg", width: 2000, height: 1570, alt: "Exploded render of a bearing housing assembly" }],
  },
  twitter: { card: "summary_large_image", title: site.title, description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0c" },
    { media: "(prefers-color-scheme: light)", color: "#f3f3f0" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Blocking, inline and tiny: applies the saved / system theme before first paint, so there's no
            flash of the wrong theme. (next/script's beforeInteractive defers inline code until the runtime loads.) */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <AmbientBackground />
        <AnchorScroll />
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
