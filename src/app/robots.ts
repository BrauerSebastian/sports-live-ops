import type { MetadataRoute } from "next";

function siteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/live/", "/privacy", "/terms"],
        disallow: ["/control", "/login", "/api", "/forbidden"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
