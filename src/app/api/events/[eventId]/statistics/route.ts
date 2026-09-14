import { NextResponse } from "next/server";
import { z } from "zod";
import { canOperate, serializeServiceError } from "@/lib/server/event-service";
import { prisma } from "@/lib/server/prisma";
import { getCurrentUser } from "@/lib/server/require-user";
import { publishLiveEvent } from "@/lib/server/event-bus";

const statisticsInput = z.object({
  homePossession: z.number().int().min(0).max(100), awayPossession: z.number().int().min(0).max(100),
  homeShots: z.number().int().min(0).max(100), awayShots: z.number().int().min(0).max(100),
  homeShotsOnTarget: z.number().int().min(0).max(100), awayShotsOnTarget: z.number().int().min(0).max(100),
  homeCorners: z.number().int().min(0).max(50), awayCorners: z.number().int().min(0).max(50),
  homeFouls: z.number().int().min(0).max(50), awayFouls: z.number().int().min(0).max(50),
}).refine((value) => value.homePossession + value.awayPossession === 100, { message: "Possession must total 100." });

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!canOperate(user.role)) return NextResponse.json({ error: "You cannot update statistics." }, { status: 403 });
  try {
    const input = statisticsInput.parse(await request.json());
    const { eventId } = await params;
    const statistic = await prisma.statistic.upsert({ where: { eventId }, create: { eventId, ...input }, update: input });
    await prisma.auditLog.create({ data: { actorId: user.id, eventId, action: "STATISTICS_UPDATED", entityType: "Statistic", entityId: statistic.id, metadata: input } });
    publishLiveEvent(eventId, "event.statistics", { statisticId: statistic.id });
    return NextResponse.json({ statistic });
  } catch (error) {
    const result = serializeServiceError(error);
    return NextResponse.json({ error: result.message, issues: "issues" in result ? result.issues : undefined }, { status: result.status });
  }
}
