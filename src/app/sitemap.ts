import type { MetadataRoute } from "next";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

function siteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/live`, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [competitions, events, articles] = await Promise.all([
      prisma.competition.findMany({ select: { id: true, updatedAt: true } }),
      prisma.sportEvent.findMany({ select: { id: true, updatedAt: true } }),
      prisma.newsArticle.findMany({ where: { status: ArticleStatus.PUBLISHED }, select: { id: true, updatedAt: true } }),
    ]);

    entries.push(
      ...competitions.map((item) => ({ url: `${base}/live/competitions/${item.id}`, lastModified: item.updatedAt, changeFrequency: "daily" as const, priority: 0.8 })),
      ...events.map((item) => ({ url: `${base}/live/events/${item.id}`, lastModified: item.updatedAt, changeFrequency: "hourly" as const, priority: 0.9 })),
      ...articles.map((item) => ({ url: `${base}/live/news/${item.id}`, lastModified: item.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    );
  } catch {
    // The static public routes remain discoverable even when the demo database is offline.
  }

  return entries;
}
