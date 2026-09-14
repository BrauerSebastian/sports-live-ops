import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sports Live Ops | Event operations",
  description: "A real-time sports competition control room and public live center.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
