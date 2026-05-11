import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/layout/SearchModal";
import { ToastProvider } from "@/components/ui/Toast";
import { generateWebsiteJsonLd } from "@/lib/json-ld";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0E" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Silsila — Hunza Valley Living Ancestry Archive",
    template: "%s | Silsila",
  },
  description:
    "Digitize, preserve, and visually explore generational family trees of all communities in the Hunza Valley, Pakistan. A community-driven genealogy archive spanning Karimabad, Altit, Ganesh, Gulmit, Shimshal, Passu, and more.",
  keywords: [
    "Hunza Valley",
    "family tree",
    "genealogy",
    "ancestry",
    "Burushaski",
    "Karimabad",
    "Pakistan",
    "heritage",
    "Silsila",
  ],
  authors: [{ name: "Silsila Community" }],
  openGraph: {
    title: "Silsila — Hunza Valley Living Ancestry Archive",
    description:
      "Explore generational family trees of the Hunza Valley communities. Preserve your heritage.",
    siteName: "Silsila",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebsiteJsonLd()) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            {/* Skip to content link for accessibility */}
            <a href="#main-content" className="skip-to-content">
              Skip to content
            </a>

            <Navbar />
            <SearchModal />

            <main id="main-content" className="flex-1">
              {children}
            </main>

            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
