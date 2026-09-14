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

export async function getEvents() {
  return prisma.sportEvent.findMany({
    include: eventWithContext,
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getFinishedEvents(limit = 6) {
  return prisma.sportEvent.findMany({
    where: { status: EventStatus.FINISHED },
    include: eventWithContext,
    orderBy: { scheduledAt: "desc" },
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

export async function getCompetitions() {
  return prisma.competition.findMany({ include: { seasons: { where: { isActive: true }, take: 1 }, _count: { select: { events: true, participants: true } } }, orderBy: { name: "asc" } });
}

export async function getCompetitionById(id: string) {
  return prisma.competition.findUnique({ where: { id }, include: { seasons: { orderBy: { startsOn: "desc" } }, participants: { include: { participant: true } }, venues: true, events: { include: eventWithContext, orderBy: { scheduledAt: "asc" } } } });
}

export async function getEditorialArticles() {
  return prisma.newsArticle.findMany({ include: { author: true, competition: true, event: true }, orderBy: { updatedAt: "desc" } });
}

export async function getArticleById(id: string, publishedOnly = false) {
  return prisma.newsArticle.findFirst({ where: { id, ...(publishedOnly ? { status: "PUBLISHED" } : {}) }, include: { author: { select: { displayName: true } }, competition: true, event: true } });
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({ include: { actor: { select: { displayName: true, email: true } }, event: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
}

export async function getNotificationOutbox() {
  return prisma.notificationOutbox.findMany({ include: { event: { select: { title: true } }, createdBy: { select: { displayName: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
}
