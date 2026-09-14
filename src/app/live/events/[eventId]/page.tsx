import { notFound } from "next/navigation";
import { RealtimePublicEvent } from "@/components/live-center/RealtimePublicEvent";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { deriveScore } from "@/lib/domain/score";
import { getEventById } from "@/lib/server/competition-repository";
import type { EventStatus, Incident } from "@/app/page";

const statusLabel: Record<string, EventStatus> = { SCHEDULED: "Scheduled", PRE_LIVE: "Pre-live", LIVE: "Live", PAUSED: "Paused", FINISHED: "Finished", DELAYED: "Delayed", CANCELLED: "Cancelled" };
const incidentLabel: Record<string, Incident["type"]> = { GOAL: "goal", YELLOW_CARD: "card", RED_CARD: "card", SUBSTITUTION: "substitution", PERIOD_STARTED: "period", PERIOD_ENDED: "period", CORRECTION: "correction" };

export default async function PublicEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  let event;
  try { event = await getEventById((await params).eventId); }
  catch { return <DataUnavailable title="Public event data unavailable" />; }
  if (!event) notFound();
  const home = event.participants.find((entry) => entry.side === "HOME");
  const away = event.participants.find((entry) => entry.side === "AWAY");
  if (!home || !away) return <DataUnavailable title="Public event data unavailable" />;
  const score = deriveScore(event.incidents, home.participantId, away.participantId);
  const incidents: Incident[] = event.incidents.map((incident) => ({ minute: incident.minute, type: incidentLabel[incident.type], label: incident.type.replaceAll("_", " "), team: incident.participant?.name, detail: incident.detail ?? incident.playerName ?? undefined }));
  return <RealtimePublicEvent eventId={event.id} status={statusLabel[event.status]} homeScore={score.home} awayScore={score.away} minute={event.currentMinute} incidents={incidents} commentary={event.liveComments.map((comment) => comment.body)} />;
}
