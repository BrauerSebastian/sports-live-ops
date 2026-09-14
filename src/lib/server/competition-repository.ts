import { EventStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

export const eventWithContext = {
  competition: true,
  venue: true,
  participants: { include: { participant: true } },
  incidents: { include: { participant: true }, orderBy: [{ minute: "desc" as const }, { createdAt: "desc" as const }] },
  liveComments: { include: { author: true }, orderBy: { publishedAt: "desc" as const } },
  statistic: true,
} satisfies Prisma.SportEventInclude;

export async function getActiveCompetition() {
  return prisma.competition.findFirst({
    include: {
      seasons: { where: { isActive: true }, take: 1 },
      participants: { include: { participant: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getLiveEvents() {
  return prisma.sportEvent.findMany({
    where: { status: { in: [EventStatus.LIVE, EventStatus.PAUSED] } },
    include: eventWithContext,
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getUpcomingEvents(limit = 6) {
  return prisma.sportEvent.findMany({
    where: { status: { in: [EventStatus.SCHEDULED, EventStatus.PRE_LIVE, EventStatus.DELAYED] } },
    include: eventWithContext,
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });
}

export async function getEventById(id: string) {
  return prisma.sportEvent.findUnique({ where: { id }, include: eventWithContext });
}

export async function getPublicNews(limit = 5) {
  return prisma.newsArticle.findMany({
    where: { status: "PUBLISHED" },
    include: { competition: true, event: true, author: { select: { displayName: true } } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}
