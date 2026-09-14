import { ArticleStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";

export const articleInput = z.object({ slug: z.string().trim().min(3).regex(/^[a-z0-9-]+$/), title: z.string().trim().min(5).max(140), summary: z.string().trim().min(10).max(280), body: z.string().trim().min(20).max(20000), status: z.nativeEnum(ArticleStatus), competitionId: z.string().cuid().nullable().optional(), eventId: z.string().cuid().nullable().optional() });
export function canEditContent(role: Role) { return role === Role.ADMIN || role === Role.EDITOR; }
export async function saveArticle(id: string | undefined, authorId: string, input: z.infer<typeof articleInput>) {
  return prisma.$transaction(async (tx) => {
    const publishedAt = input.status === ArticleStatus.PUBLISHED ? new Date() : null;
    const article = id ? await tx.newsArticle.update({ where: { id }, data: { ...input, publishedAt } }) : await tx.newsArticle.create({ data: { ...input, authorId, publishedAt } });
    await tx.auditLog.create({ data: { actorId: authorId, action: id ? input.status === ArticleStatus.PUBLISHED ? "ARTICLE_PUBLISHED" : "ARTICLE_UPDATED" : "ARTICLE_CREATED", entityType: "NewsArticle", entityId: article.id, metadata: { status: input.status } } });
    if (input.status === ArticleStatus.PUBLISHED) await tx.notificationOutbox.create({ data: { createdById: authorId, type: "ARTICLE_PUBLISHED", audience: "PUBLIC_FOLLOWERS", payload: { articleId: article.id, slug: article.slug } } });
    return article;
  });
}
