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
  description: "A real-time sports competition Control Room and public Live Center built as a full-stack portfolio demonstration.",
  applicationName: "Sports Live Ops",
  keywords: ["sports technology", "live events", "match center", "sports operations", "real-time sports"],
  authors: [{ name: "Sebastián Valenzuela" }],
  creator: "Sebastián Valenzuela",
  openGraph: {
    type: "website",
    title: "Sports Live Ops",
    description: "Operate live sports events and publish updates to a public Live Center in real time.",
    siteName: "Sports Live Ops",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports Live Ops",
    description: "Real-time sports event operations and public live reporting.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#1b2021",
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
