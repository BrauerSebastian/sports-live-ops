import { notFound } from "next/navigation";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { PersistentEventControl } from "@/components/operations/PersistentEventControl";
import { deriveScore } from "@/lib/domain/score";
import { getEventById } from "@/lib/server/competition-repository";
import type { EventStatus, IncidentType } from "@/app/page";

const statusLabel: Record<string, EventStatus> = { SCHEDULED: "Scheduled", PRE_LIVE: "Pre-live", LIVE: "Live", PAUSED: "Paused", FINISHED: "Finished", DELAYED: "Delayed", CANCELLED: "Cancelled" };
const incidentLabel: Record<string, { type: IncidentType; label: string }> = { GOAL: { type: "goal", label: "Goal" }, YELLOW_CARD: { type: "card", label: "Yellow card" }, RED_CARD: { type: "card", label: "Red card" }, SUBSTITUTION: { type: "substitution", label: "Substitution" }, PERIOD_STARTED: { type: "period", label: "Period started" }, PERIOD_ENDED: { type: "period", label: "Period ended" }, CORRECTION: { type: "correction", label: "Correction" } };

export default async function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  let event;
  try { event = await getEventById((await params).eventId); }
  catch { return <DataUnavailable title="Event data unavailable" />; }
  if (!event) notFound();
  const home = event.participants.find((entry) => entry.side === "HOME");
  const away = event.participants.find((entry) => entry.side === "AWAY");
  if (!home || !away) return <DataUnavailable title="Event participants unavailable" />;
  const score = deriveScore(event.incidents, home.participantId, away.participantId);
  const incidents = event.incidents.map((incident) => ({ minute: incident.minute, type: incidentLabel[incident.type].type, label: incidentLabel[incident.type].label, team: incident.participant?.name, detail: incident.detail ?? incident.playerName ?? undefined }));
  return <PersistentEventControl eventId={event.id} initialStatus={statusLabel[event.status]} initialMinute={event.currentMinute} initialHomeScore={score.home} initialAwayScore={score.away} initialIncidents={incidents} initialCommentary={event.liveComments.map((comment) => comment.body)} homeParticipantId={home.participantId} awayParticipantId={away.participantId} />;
}
