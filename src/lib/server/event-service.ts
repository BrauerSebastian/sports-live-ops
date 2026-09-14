import { EventStatus, IncidentType, Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { assertTransition } from "@/lib/domain/event-state";
import { deriveScore } from "@/lib/domain/score";
import { calculateStandings } from "@/lib/domain/standings";
import { prisma } from "@/lib/server/prisma";
import { publishLiveEvent } from "@/lib/server/event-bus";

export const statusInput = z.object({ status: z.nativeEnum(EventStatus) });
export const clockInput = z.object({ minute: z.number().int().min(0).max(130) });
export const incidentInput = z.object({
  type: z.nativeEnum(IncidentType),
  minute: z.number().int().min(0).max(130),
  participantId: z.string().cuid().nullable().optional(),
  playerName: z.string().trim().max(80).nullable().optional(),
  assistName: z.string().trim().max(80).nullable().optional(),
  detail: z.string().trim().max(240).nullable().optional(),
  correctsIncidentId: z.string().cuid().nullable().optional(),
}).superRefine((input, ctx) => {
  if ((input.type === IncidentType.GOAL || input.type === IncidentType.YELLOW_CARD || input.type === IncidentType.RED_CARD) && !input.participantId) {
    ctx.addIssue({ code: "custom", path: ["participantId"], message: "This incident requires an event participant." });
  }
  if (input.type === IncidentType.CORRECTION && !input.correctsIncidentId) {
    ctx.addIssue({ code: "custom", path: ["correctsIncidentId"], message: "A correction must reference an existing incident." });
  }
});
export const commentaryInput = z.object({ body: z.string().trim().min(1).max(500), minute: z.number().int().min(0).max(130) });
export const statisticsInput = z.object({
  homePossession: z.number().int().min(0).max(100), awayPossession: z.number().int().min(0).max(100),
  homeShots: z.number().int().min(0).max(100), awayShots: z.number().int().min(0).max(100),
  homeShotsOnTarget: z.number().int().min(0).max(100), awayShotsOnTarget: z.number().int().min(0).max(100),
  homeCorners: z.number().int().min(0).max(50), awayCorners: z.number().int().min(0).max(50),
  homeFouls: z.number().int().min(0).max(50), awayFouls: z.number().int().min(0).max(50),
}).superRefine((value, ctx) => {
  if (value.homePossession + value.awayPossession !== 100) ctx.addIssue({ code: "custom", path: ["homePossession"], message: "Possession must total 100." });
  if (value.homeShotsOnTarget > value.homeShots) ctx.addIssue({ code: "custom", path: ["homeShotsOnTarget"], message: "Home shots on target cannot exceed home shots." });
  if (value.awayShotsOnTarget > value.awayShots) ctx.addIssue({ code: "custom", path: ["awayShotsOnTarget"], message: "Away shots on target cannot exceed away shots." });
});

export function canOperate(role: Role) { return role === Role.ADMIN || role === Role.OPERATOR; }
export function canPublishCommentary(role: Role) { return canOperate(role); }

function assertLiveMutable(status: EventStatus) {
  if (status !== EventStatus.LIVE && status !== EventStatus.PAUSED) throw new Error("EVENT_NOT_LIVE");
}

export async function transitionEvent(eventId: string, status: EventStatus, actorId: string) {
  const updated = await prisma.$transaction(async (tx) => {
    const event = await tx.sportEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("EVENT_NOT_FOUND");
    assertTransition(event.status, status);
    const timestamps = status === EventStatus.LIVE && !event.startedAt ? { startedAt: new Date() } : status === EventStatus.FINISHED ? { endedAt: new Date() } : {};
    const updatedEvent = await tx.sportEvent.update({ where: { id: eventId }, data: { status, ...timestamps } });
    if (status === EventStatus.FINISHED) await rebuildStandings(tx, event.seasonId);
    await tx.auditLog.create({ data: { actorId, eventId, action: `EVENT_${status}`, entityType: "SportEvent", entityId: eventId, metadata: { from: event.status, to: status } } });
    await tx.notificationOutbox.create({ data: { createdById: actorId, eventId, type: `EVENT_${status}`, audience: "PUBLIC_FOLLOWERS", payload: { eventId, status } } });
    return updatedEvent;
  });
  publishLiveEvent(eventId, "event.status", { status: updated.status, currentMinute: updated.currentMinute });
  return updated;
}

export async function updateEventClock(eventId: string, actorId: string, input: z.infer<typeof clockInput>) {
  const updated = await prisma.$transaction(async (tx) => {
    const event = await tx.sportEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("EVENT_NOT_FOUND");
    assertLiveMutable(event.status);
    const updatedEvent = await tx.sportEvent.update({ where: { id: eventId }, data: { currentMinute: input.minute } });
    await tx.auditLog.create({ data: { actorId, eventId, action: "CLOCK_UPDATED", entityType: "SportEvent", entityId: eventId, metadata: { from: event.currentMinute, to: input.minute } } });
    return updatedEvent;
  });
  publishLiveEvent(eventId, "event.clock", { minute: updated.currentMinute });
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
    assertLiveMutable(event.status);

    if (input.participantId) {
      const participant = await tx.eventParticipant.findUnique({ where: { eventId_participantId: { eventId, participantId: input.participantId } } });
      if (!participant) throw new Error("PARTICIPANT_NOT_IN_EVENT");
    }

    if (input.correctsIncidentId) {
      const target = await tx.incident.findFirst({ where: { id: input.correctsIncidentId, eventId } });
      if (!target) throw new Error("CORRECTION_TARGET_NOT_FOUND");
      if (target.type === IncidentType.CORRECTION) throw new Error("CORRECTION_TARGET_INVALID");
      const priorCorrection = await tx.incident.findFirst({ where: { eventId, type: IncidentType.CORRECTION, correctsIncidentId: target.id } });
      if (priorCorrection) throw new Error("INCIDENT_ALREADY_CORRECTED");
    }

    const created = await tx.incident.create({ data: { eventId, createdById: actorId, type: input.type, minute: input.minute, participantId: input.participantId ?? null, playerName: input.playerName ?? null, assistName: input.assistName ?? null, detail: input.detail ?? null, correctsIncidentId: input.correctsIncidentId ?? null } });
    await tx.sportEvent.update({ where: { id: eventId }, data: { currentMinute: input.minute } });
    await tx.auditLog.create({ data: { actorId, eventId, action: input.type === IncidentType.CORRECTION ? "INCIDENT_CORRECTED" : "INCIDENT_CREATED", entityType: "Incident", entityId: created.id, metadata: { type: input.type, minute: input.minute, correctsIncidentId: input.correctsIncidentId ?? null } } });
    await tx.notificationOutbox.create({ data: { createdById: actorId, eventId, type: input.type === IncidentType.GOAL ? "GOAL" : input.type === IncidentType.CORRECTION ? "INCIDENT_CORRECTED" : "INCIDENT_CREATED", audience: "PUBLIC_FOLLOWERS", payload: { incidentId: created.id, type: input.type, minute: input.minute } } });
    return created;
  });
  publishLiveEvent(eventId, "event.incident", { incidentId: incident.id, type: incident.type, minute: incident.minute });
  return incident;
}

export async function publishCommentary(eventId: string, actorId: string, input: z.infer<typeof commentaryInput>) {
  const comment = await prisma.$transaction(async (tx) => {
    const event = await tx.sportEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("EVENT_NOT_FOUND");
    assertLiveMutable(event.status);
    const created = await tx.liveComment.create({ data: { eventId, authorId: actorId, body: input.body, minute: input.minute } });
    await tx.auditLog.create({ data: { actorId, eventId, action: "COMMENTARY_PUBLISHED", entityType: "LiveComment", entityId: created.id } });
    await tx.notificationOutbox.create({ data: { createdById: actorId, eventId, type: "COMMENTARY_PUBLISHED", audience: "PUBLIC_FOLLOWERS", payload: { commentId: created.id, minute: input.minute } } });
    return created;
  });
  publishLiveEvent(eventId, "event.commentary", { commentId: comment.id, minute: comment.minute });
  return comment;
}

export async function updateStatistics(eventId: string, actorId: string, input: z.infer<typeof statisticsInput>) {
  const statistic = await prisma.$transaction(async (tx) => {
    const event = await tx.sportEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("EVENT_NOT_FOUND");
    assertLiveMutable(event.status);
    const updated = await tx.statistic.upsert({ where: { eventId }, create: { eventId, ...input }, update: input });
    await tx.auditLog.create({ data: { actorId, eventId, action: "STATISTICS_UPDATED", entityType: "Statistic", entityId: updated.id, metadata: input } });
    return updated;
  });
  publishLiveEvent(eventId, "event.statistics", { statisticId: statistic.id });
  return statistic;
}

export function serializeServiceError(error: unknown) {
  if (error instanceof z.ZodError) return { status: 400, message: "The submitted event data is invalid.", issues: error.issues };
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return { status: 404, message: "The requested event was not found." };
    return { status: 500, message: "The event could not be saved." };
  }
  const message = error instanceof Error ? error.message : "UNKNOWN";
  const conflictErrors = new Set(["EVENT_NOT_LIVE", "PARTICIPANT_NOT_IN_EVENT", "CORRECTION_TARGET_REQUIRED", "CORRECTION_TARGET_NOT_FOUND", "CORRECTION_TARGET_INVALID", "INCIDENT_ALREADY_CORRECTED"]);
  if (message === "EVENT_NOT_FOUND") return { status: 404, message: "The requested event was not found." };
  if (conflictErrors.has(message)) return { status: 409, message: message.replaceAll("_", " ").toLowerCase() };
  if (message.startsWith("Invalid event transition")) return { status: 409, message };
  return { status: 400, message: "The event action could not be completed." };
}
