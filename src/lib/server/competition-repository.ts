import { EventStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

export const eventWithContext = {
  competition: true,
  season: true,
  venue: true,
  participants: { include: { participant: true } },
  incidents: { include: { participant: true }, orderBy: [{ minute: "desc" as const }, { createdAt: "desc" as const }] },
  liveComments: { include: { author: true }, orderBy: { publishedAt: "desc" as const } },
  statistic: true,
  newsArticles: { where: { status: "PUBLISHED" as const }, select: { id: true, title: true, summary: true, publishedAt: true }, orderBy: { publishedAt: "desc" as const } },
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

export async function getEvents(status?: EventStatus, competitionId?: string) {
  return prisma.sportEvent.findMany({
    where: { ...(status ? { status } : {}), ...(competitionId ? { competitionId } : {}) },
    include: eventWithContext,
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getAttentionEvents(limit = 6) {
  return prisma.sportEvent.findMany({
    where: { status: { in: [EventStatus.PAUSED, EventStatus.DELAYED] } },
    include: eventWithContext,
    orderBy: { updatedAt: "desc" },
    take: limit,
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
  return prisma.competition.findUnique({
    where: { id },
    include: {
      seasons: { orderBy: { startsOn: "desc" }, include: { standings: { include: { participant: true }, orderBy: [{ points: "desc" }, { goalDifference: "desc" }, { goalsFor: "desc" }] } } },
      participants: { include: { participant: true } },
      venues: true,
      events: { include: eventWithContext, orderBy: { scheduledAt: "asc" } },
      newsArticles: { where: { status: "PUBLISHED" }, include: { author: { select: { displayName: true } } }, orderBy: { publishedAt: "desc" }, take: 5 },
    },
  });
}

export async function getEditorialArticles() {
  return prisma.newsArticle.findMany({ include: { author: true, competition: true, event: true }, orderBy: { updatedAt: "desc" } });
}

export async function getArticleById(id: string, publishedOnly = false) {
  return prisma.newsArticle.findFirst({ where: { id, ...(publishedOnly ? { status: "PUBLISHED" } : {}) }, include: { author: { select: { displayName: true } }, competition: true, event: true } });
}

export type AuditFilters = { actor?: string; action?: string; entityType?: string; date?: string };

export async function getAuditLogs(filters: AuditFilters = {}) {
  const start = filters.date ? new Date(`${filters.date}T00:00:00.000Z`) : undefined;
  const end = start ? new Date(start.getTime() + 24 * 60 * 60 * 1000) : undefined;
  return prisma.auditLog.findMany({
    where: {
      ...(filters.action ? { action: { contains: filters.action, mode: "insensitive" } } : {}),
      ...(filters.entityType ? { entityType: { contains: filters.entityType, mode: "insensitive" } } : {}),
      ...(filters.actor ? { actor: { is: { OR: [{ displayName: { contains: filters.actor, mode: "insensitive" } }, { email: { contains: filters.actor, mode: "insensitive" } }] } } } : {}),
      ...(start && end ? { createdAt: { gte: start, lt: end } } : {}),
    },
    include: { actor: { select: { displayName: true, email: true } }, event: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getNotificationOutbox() {
  return prisma.notificationOutbox.findMany({ include: { event: { select: { title: true } }, createdBy: { select: { displayName: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
}
