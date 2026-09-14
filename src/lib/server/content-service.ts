import { ArticleStatus, Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";

export const articleInput = z.object({
  slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(5).max(140),
  summary: z.string().trim().min(10).max(280),
  body: z.string().trim().min(20).max(20000),
  status: z.nativeEnum(ArticleStatus),
  competitionId: z.string().cuid().nullable().optional(),
  eventId: z.string().cuid().nullable().optional(),
});

export function canEditContent(role: Role) { return role === Role.ADMIN || role === Role.EDITOR; }

export async function saveArticle(id: string | undefined, authorId: string, input: z.infer<typeof articleInput>) {
  return prisma.$transaction(async (tx) => {
    const existing = id ? await tx.newsArticle.findUnique({ where: { id } }) : null;
    if (id && !existing) throw new Error("ARTICLE_NOT_FOUND");

    if (input.competitionId) {
      const competition = await tx.competition.findUnique({ where: { id: input.competitionId }, select: { id: true } });
      if (!competition) throw new Error("COMPETITION_NOT_FOUND");
    }
    if (input.eventId) {
      const event = await tx.sportEvent.findUnique({ where: { id: input.eventId }, select: { id: true, competitionId: true } });
      if (!event) throw new Error("EVENT_NOT_FOUND");
      if (input.competitionId && event.competitionId !== input.competitionId) throw new Error("EVENT_COMPETITION_MISMATCH");
    }

    const wasPublished = existing?.status === ArticleStatus.PUBLISHED;
    const isPublished = input.status === ArticleStatus.PUBLISHED;
    const publishedAt = isPublished ? (wasPublished ? existing?.publishedAt ?? new Date() : new Date()) : null;
    const article = existing
      ? await tx.newsArticle.update({ where: { id: existing.id }, data: { ...input, publishedAt } })
      : await tx.newsArticle.create({ data: { ...input, authorId, publishedAt } });

    const action = !existing ? (isPublished ? "ARTICLE_PUBLISHED" : "ARTICLE_CREATED") : !wasPublished && isPublished ? "ARTICLE_PUBLISHED" : wasPublished && !isPublished ? "ARTICLE_UNPUBLISHED" : "ARTICLE_UPDATED";
    await tx.auditLog.create({ data: { actorId: authorId, action, entityType: "NewsArticle", entityId: article.id, metadata: { status: input.status, competitionId: input.competitionId ?? null, eventId: input.eventId ?? null } } });
    if (!wasPublished && isPublished) await tx.notificationOutbox.create({ data: { createdById: authorId, eventId: input.eventId ?? null, type: "ARTICLE_PUBLISHED", audience: "PUBLIC_FOLLOWERS", payload: { articleId: article.id, slug: article.slug, competitionId: input.competitionId ?? null, eventId: input.eventId ?? null } } });
    return article;
  });
}

export function serializeContentError(error: unknown) {
  if (error instanceof z.ZodError) return { status: 400, message: "The article data is invalid.", issues: error.issues };
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return { status: 409, message: "An article already uses that slug." };
    if (error.code === "P2025") return { status: 404, message: "The requested article was not found." };
    return { status: 500, message: "The article could not be saved." };
  }
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "ARTICLE_NOT_FOUND") return { status: 404, message: "The requested article was not found." };
  if (message === "COMPETITION_NOT_FOUND" || message === "EVENT_NOT_FOUND") return { status: 400, message: "The selected association no longer exists." };
  if (message === "EVENT_COMPETITION_MISMATCH") return { status: 400, message: "The selected event does not belong to the selected competition." };
  return { status: 500, message: "The article could not be saved." };
}
