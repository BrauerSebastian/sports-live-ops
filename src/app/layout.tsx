import type { Metadata, Viewport } from "next";
import { CookieConsent } from "@/components/privacy/CookieConsent";
import { ConsentAnalytics } from "@/components/analytics/ConsentAnalytics";
import "./globals.css";

const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sports Live Ops | Live event operations",
    template: "%s | Sports Live Ops",
  },
  description: "Live match operations, event control, fixtures, results, standings and public match updates.",
  applicationName: "Sports Live Ops",
  keywords: ["sports technology", "live events", "match center", "sports operations", "real-time sports"],
  authors: [{ name: "Sebastián Valenzuela" }],
  creator: "Sebastián Valenzuela",
  openGraph: {
    type: "website",
    title: "Sports Live Ops",
    description: "Live match operations and public event updates from one shared event state.",
    siteName: "Sports Live Ops",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports Live Ops",
    description: "Live match operations and public event reporting.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0B1015",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
        <ConsentAnalytics />
      </body>
    </html>
  );
}
