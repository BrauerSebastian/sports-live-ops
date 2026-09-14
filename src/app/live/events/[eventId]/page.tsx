import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RealtimePublicEvent } from "@/components/live-center/RealtimePublicEvent";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { deriveScore } from "@/lib/domain/score";
import { getEventById } from "@/lib/server/competition-repository";
import type { CommentaryItem, EventContext, EventStatus, Incident, IncidentType, MatchStatistics, RelatedNewsItem } from "@/types/event";

export const dynamic = "force-dynamic";


export async function generateMetadata({ params }: { params: Promise<{ eventId: string }> }): Promise<Metadata> {
  try {
    const event = await getEventById((await params).eventId);
    if (!event) return { title: "Event not found" };
    return {
      title: event.title,
      description: `${event.competition.name}: ${event.title} at ${event.venue.name}. Live timeline, commentary and statistics.`,
      alternates: { canonical: `/live/events/${event.id}` },
    };
  } catch {
    return { title: "Live event" };
  }
}

const statusLabel: Record<string, EventStatus> = { SCHEDULED: "Scheduled", PRE_LIVE: "Pre-live", LIVE: "Live", PAUSED: "Paused", FINISHED: "Finished", DELAYED: "Delayed", CANCELLED: "Cancelled" };
const incidentLabel: Record<string, { type: IncidentType; label: string }> = {
  GOAL: { type: "goal", label: "Goal" },
  YELLOW_CARD: { type: "yellow-card", label: "Yellow card" },
  RED_CARD: { type: "red-card", label: "Red card" },
  SUBSTITUTION: { type: "substitution", label: "Substitution" },
  PERIOD_STARTED: { type: "period-start", label: "Period started" },
  PERIOD_ENDED: { type: "period-end", label: "Period ended" },
  CORRECTION: { type: "correction", label: "Correction" },
};

export default async function PublicEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  let event;
  try { event = await getEventById((await params).eventId); }
  catch { return <DataUnavailable title="Public event data unavailable" />; }
  if (!event) notFound();

  const home = event.participants.find((entry) => entry.side === "HOME");
  const away = event.participants.find((entry) => entry.side === "AWAY");
  if (!home || !away) return <DataUnavailable title="Public event data unavailable" />;

  const correctedIds = new Set(event.incidents.map((incident) => incident.correctsIncidentId).filter((id): id is string => Boolean(id)));
  const score = deriveScore(event.incidents, home.participantId, away.participantId);
  const incidents: Incident[] = event.incidents.map((incident) => ({
    id: incident.id,
    minute: incident.minute,
    type: incidentLabel[incident.type].type,
    label: incidentLabel[incident.type].label,
    team: incident.participant?.name,
    teamId: incident.participantId ?? undefined,
    detail: incident.detail ?? incident.playerName ?? undefined,
    corrected: correctedIds.has(incident.id),
  }));

  const commentary: CommentaryItem[] = event.liveComments.map((comment) => ({
    id: comment.id,
    minute: comment.minute,
    body: comment.body,
    author: comment.author.displayName,
    publishedAt: comment.publishedAt.toISOString(),
  }));

  const context: EventContext = {
    id: event.id,
    competitionId: event.competitionId,
    title: event.title,
    competitionName: event.competition.name,
    seasonName: event.season.name,
    venueName: event.venue.name,
    venueCity: event.venue.city,
    home: { id: home.participantId, name: home.participant.name, shortName: home.participant.shortName, code: home.participant.code, side: "HOME" },
    away: { id: away.participantId, name: away.participant.name, shortName: away.participant.shortName, code: away.participant.code, side: "AWAY" },
  };

  const relatedNews: RelatedNewsItem[] = event.newsArticles.map((article) => ({
    id: article.id,
    title: article.title,
    summary: article.summary,
    publishedAt: article.publishedAt?.toISOString(),
  }));

  const statistic = event.statistic;
  const statistics: MatchStatistics = {
    possession: { home: statistic?.homePossession ?? 50, away: statistic?.awayPossession ?? 50 },
    shots: { home: statistic?.homeShots ?? 0, away: statistic?.awayShots ?? 0 },
    shotsOnTarget: { home: statistic?.homeShotsOnTarget ?? 0, away: statistic?.awayShotsOnTarget ?? 0 },
    corners: { home: statistic?.homeCorners ?? 0, away: statistic?.awayCorners ?? 0 },
    fouls: { home: statistic?.homeFouls ?? 0, away: statistic?.awayFouls ?? 0 },
  };

  return <RealtimePublicEvent eventId={event.id} context={context} status={statusLabel[event.status]} homeScore={score.home} awayScore={score.away} minute={event.currentMinute} incidents={incidents} commentary={commentary} statistics={statistics} relatedNews={relatedNews} />;
}
