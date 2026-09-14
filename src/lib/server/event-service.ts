import { EventStatus, IncidentType, Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { assertTransition } from "@/lib/domain/event-state";
import { deriveScore } from "@/lib/domain/score";
import { calculateStandings } from "@/lib/domain/standings";
import { prisma } from "@/lib/server/prisma";
import { publishLiveEvent } from "@/lib/server/event-bus";

export const statusInput = z.object({ status: z.nativeEnum(EventStatus) });
export const incidentInput = z.object({
  type: z.nativeEnum(IncidentType),
  minute: z.number().int().min(0).max(130),
  participantId: z.string().cuid().nullable().optional(),
  playerName: z.string().trim().max(80).nullable().optional(),
  assistName: z.string().trim().max(80).nullable().optional(),
  detail: z.string().trim().max(240).nullable().optional(),
  correctsIncidentId: z.string().cuid().nullable().optional(),
});
export const commentaryInput = z.object({ body: z.string().trim().min(1).max(500), minute: z.number().int().min(0).max(130) });

export function canOperate(role: Role) {
  return role === Role.ADMIN || role === Role.OPERATOR;
}

export async function transitionEvent(eventId: string, status: EventStatus, actorId: string) {
  const updated = await prisma.$transaction(async (tx) => {
    const event = await tx.sportEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("EVENT_NOT_FOUND");
    assertTransition(event.status, status);
    const timestamps = status === EventStatus.LIVE && !event.startedAt ? { startedAt: new Date() } : status === EventStatus.FINISHED ? { endedAt: new Date() } : {};
    const updated = await tx.sportEvent.update({ where: { id: eventId }, data: { status, ...timestamps } });
    if (status === EventStatus.FINISHED) await rebuildStandings(tx, event.seasonId);
    await tx.auditLog.create({ data: { actorId, eventId, action: `EVENT_${status}`, entityType: "SportEvent", entityId: eventId, metadata: { from: event.status, to: status } } });
    await tx.notificationOutbox.create({ data: { createdById: actorId, eventId, type: `EVENT_${status}`, audience: "PUBLIC_FOLLOWERS", payload: { eventId, status } } });
    return updated;
  });
  publishLiveEvent(eventId, "event.status", { status: updated.status, currentMinute: updated.currentMinute });
  return updated;
}

async function rebuildStandings(tx: Prisma.TransactionClient, seasonId: string) {
  const [participants, matches] = await Promise.all([
    tx.season.findUnique({ where: { id: seasonId }, include: { competition: { include: { participants: true } } } }).then((season) => season?.competition.participants.map((entry) => entry.participantId) ?? []),
    tx.sportEvent.findMany({ where: { seasonId, status: EventStatus.FINISHED }, include: { participants: true, incidents: true } }),
  ]);
  const finishedMatches = matches.flatMap((match) => {
    const home = match.participants.find((participant) => participant.side === "HOME");
    const away = match.participants.find((participant) => participant.side === "AWAY");
    if (!home || !away) return [];
    const score = deriveScore(match.incidents, home.participantId, away.participantId);
    return [{ homeParticipantId: home.participantId, awayParticipantId: away.participantId, homeGoals: score.home, awayGoals: score.away }];
  });
  const rows = calculateStandings(participants, finishedMatches);
  await tx.standing.deleteMany({ where: { seasonId } });
  if (rows.length) await tx.standing.createMany({ data: rows.map((row) => ({ seasonId, ...row })) });
}

export async function createIncident(eventId: string, actorId: string, input: z.infer<typeof incidentInput>) {
  const incident = await prisma.$transaction(async (tx) => {
    const event = await tx.sportEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("EVENT_NOT_FOUND");
    if (event.status !== EventStatus.LIVE && event.status !== EventStatus.PAUSED) throw new Error("EVENT_NOT_LIVE");
    if (input.participantId) {
      const participant = await tx.eventParticipant.findUnique({ where: { eventId_participantId: { eventId, participantId: input.participantId } } });
      if (!participant) throw new Error("PARTICIPANT_NOT_IN_EVENT");
    }
    if (input.type === IncidentType.CORRECTION && !input.correctsIncidentId) throw new Error("CORRECTION_TARGET_REQUIRED");
    const incident = await tx.incident.create({ data: { eventId, createdById: actorId, type: input.type, minute: input.minute, participantId: input.participantId ?? null, playerName: input.playerName ?? null, assistName: input.assistName ?? null, detail: input.detail ?? null, correctsIncidentId: input.correctsIncidentId ?? null } });
    await tx.sportEvent.update({ where: { id: eventId }, data: { currentMinute: input.minute } });
    await tx.auditLog.create({ data: { actorId, eventId, action: input.type === IncidentType.CORRECTION ? "INCIDENT_CORRECTED" : "INCIDENT_CREATED", entityType: "Incident", entityId: incident.id, metadata: { type: input.type, minute: input.minute } } });
    await tx.notificationOutbox.create({ data: { createdById: actorId, eventId, type: input.type === IncidentType.GOAL ? "GOAL" : "INCIDENT_CREATED", audience: "PUBLIC_FOLLOWERS", payload: { incidentId: incident.id, type: input.type, minute: input.minute } } });
    return incident;
  });
  publishLiveEvent(eventId, "event.incident", { incidentId: incident.id, type: incident.type, minute: incident.minute });
  return incident;
}

export async function publishCommentary(eventId: string, actorId: string, input: z.infer<typeof commentaryInput>) {
  const comment = await prisma.$transaction(async (tx) => {
    const event = await tx.sportEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("EVENT_NOT_FOUND");
    if (event.status !== EventStatus.LIVE && event.status !== EventStatus.PAUSED) throw new Error("EVENT_NOT_LIVE");
    const comment = await tx.liveComment.create({ data: { eventId, authorId: actorId, body: input.body, minute: input.minute } });
    await tx.auditLog.create({ data: { actorId, eventId, action: "COMMENTARY_PUBLISHED", entityType: "LiveComment", entityId: comment.id } });
    await tx.notificationOutbox.create({ data: { createdById: actorId, eventId, type: "COMMENTARY_PUBLISHED", audience: "PUBLIC_FOLLOWERS", payload: { commentId: comment.id, minute: input.minute } } });
    return comment;
  });
  publishLiveEvent(eventId, "event.commentary", { commentId: comment.id, minute: comment.minute });
  return comment;
}

export function serializeServiceError(error: unknown) {
  if (error instanceof z.ZodError) return { status: 400, message: "The submitted event data is invalid.", issues: error.issues };
  if (error instanceof Prisma.PrismaClientKnownRequestError) return { status: 500, message: "The event could not be saved." };
  const message = error instanceof Error ? error.message : "UNKNOWN";
  const status = message === "EVENT_NOT_FOUND" ? 404 : message === "EVENT_NOT_LIVE" || message === "PARTICIPANT_NOT_IN_EVENT" || message === "CORRECTION_TARGET_REQUIRED" ? 409 : 400;
  return { status, message: status === 400 ? "The event action could not be completed." : message.replaceAll("_", " ").toLowerCase() };
}
