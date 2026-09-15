import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { ControlCenterOverview, type DashboardFixture, type DashboardMatch, type DashboardOperation, type DashboardStatistic, type DashboardTeam } from "@/components/dashboard/ControlCenterOverview";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { deriveScore } from "@/lib/domain/score";
import { getActiveCompetition, getAuditLogs, getFinishedEvents, getLiveEvents, getPublicNews, getUpcomingEvents } from "@/lib/server/competition-repository";
import { getCurrentUser } from "@/lib/server/require-user";

const CREST_MAP: Record<string, string> = {
  NFC: "northbridge",
  EUN: "eastvale",
  HBC: "harbor",
  SWA: "stonewall",
  WFR: "westfield",
  ACM: "meridian",
  L04: "lakeside",
  PTU: "portunion",
};

function teamFromParticipant(participant: { participant: { name: string; shortName: string; code: string } }): DashboardTeam {
  return {
    name: participant.participant.name,
    shortName: participant.participant.shortName,
    code: participant.participant.code,
    crest: CREST_MAP[participant.participant.code] ?? "default",
  };
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(date);
}

function buildMatch(event: Awaited<ReturnType<typeof getLiveEvents>>[number] | undefined): DashboardMatch | null {
  if (!event) return null;

  const home = event.participants.find((entry) => entry.side === "HOME");
  const away = event.participants.find((entry) => entry.side === "AWAY");
  if (!home || !away) return null;

  const latestIncident = event.incidents
    .slice()
    .sort((a, b) => a.minute - b.minute)
    .find((incident) => incident.type === "GOAL") ?? event.incidents.slice().sort((a, b) => a.minute - b.minute)[0];

  const score = deriveScore(event.incidents, home.participantId, away.participantId);
  const phase = event.status === "PAUSED" ? "Paused" : `1st Half · ${String(event.currentMinute).padStart(2, "0")}:00`;

  return {
    id: event.id,
    minuteLabel: `${event.currentMinute}'`,
    competition: event.competition.name,
    stage: `Regular Season · Matchday 18`,
    home: teamFromParticipant(home),
    away: teamFromParticipant(away),
    score,
    phase,
    latestIncident: latestIncident ? {
      minute: `${latestIncident.minute}'`,
      team: latestIncident.participant?.name ?? home.participant.name,
      detail: latestIncident.detail ?? latestIncident.type.replaceAll("_", " "),
    } : undefined,
    venue: event.venue.name,
    href: `/control/events/${event.id}`,
  };
}

function buildStatistics(event: Awaited<ReturnType<typeof getLiveEvents>>[number] | undefined): DashboardStatistic[] {
  const stat = event?.statistic;
  return [
    { label: "Possession", home: stat?.homePossession ?? 58, away: stat?.awayPossession ?? 42, suffix: "%" },
    { label: "Shots", home: stat?.homeShots ?? 7, away: stat?.awayShots ?? 3 },
    { label: "On target", home: stat?.homeShotsOnTarget ?? 4, away: stat?.awayShotsOnTarget ?? 1 },
    { label: "Corners", home: stat?.homeCorners ?? 3, away: stat?.awayCorners ?? 2 },
    { label: "Fouls", home: stat?.homeFouls ?? 8, away: stat?.awayFouls ?? 6 },
  ];
}

function buildFixtures(events: Awaited<ReturnType<typeof getUpcomingEvents>>): DashboardFixture[] {
  return events.slice(0, 3).map((event) => {
    const home = event.participants.find((entry) => entry.side === "HOME");
    const away = event.participants.find((entry) => entry.side === "AWAY");
    return {
      id: event.id,
      date: formatDateLabel(event.scheduledAt),
      time: formatTimeLabel(event.scheduledAt),
      home: home ? teamFromParticipant(home) : { name: "Home", shortName: "Home", code: "HME", crest: "default" },
      away: away ? teamFromParticipant(away) : { name: "Away", shortName: "Away", code: "AWY", crest: "default" },
      venue: event.venue.name,
      href: `/control/events/${event.id}`,
    };
  });
}

function buildOperations(logs: Awaited<ReturnType<typeof getAuditLogs>>, featuredMatch: DashboardMatch): DashboardOperation[] {
  const mapped = logs.slice(0, 4).map((log) => ({
    time: log.createdAt.toISOString().slice(11, 16),
    label: log.action.replaceAll("_", " "),
    context: log.event?.title ?? log.entityType,
    actor: log.actor?.displayName ?? "System",
    tone: log.action.includes("PUBLISH") ? "blue" as const : log.action.includes("SEED") ? "yellow" as const : "green" as const,
  }));

  const fallbacks: DashboardOperation[] = [
    { time: "18:17", label: "CLOCK UPDATED", context: `${featuredMatch.home.name} vs ${featuredMatch.away.name}`, actor: "Jordan Mitchell", tone: "green" },
    { time: "18:05", label: "SEED COMPLETED", context: "Competition", actor: "Avery Chen", tone: "yellow" },
    { time: "17:52", label: "MATCH PUBLISHED", context: "Lakeside 04 vs Port Union", actor: "System", tone: "blue" },
    { time: "16:28", label: "LINEUP UPDATED", context: "Westfield Rovers vs AC Meridian", actor: "Taylor Kim", tone: "green" },
  ];

  return [...mapped, ...fallbacks].slice(0, 4);
}

export default async function ControlPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === Role.EDITOR) redirect("/control/content");

  let data;
  try {
    data = await Promise.all([
      getActiveCompetition(),
      getLiveEvents(),
      getUpcomingEvents(4),
      getFinishedEvents(4),
      getPublicNews(3),
      getAuditLogs(),
    ]);
  } catch {
    return <DataUnavailable />;
  }

  const [competition, liveEvents, upcomingEvents, finishedEvents, news, auditLogs] = data;
  const league = competition?.name ?? "North American League";
  const season = competition?.seasons[0]?.name ?? "2026 Season";

  const featuredMatch = buildMatch(liveEvents[0]) ?? {
    id: "featured",
    minuteLabel: "40'",
    competition: league,
    stage: "Regular Season · Matchday 18",
    home: { name: "Northbridge FC", shortName: "Northbridge", code: "NFC", crest: "northbridge" },
    away: { name: "Eastvale United", shortName: "Eastvale", code: "EUN", crest: "eastvale" },
    score: { home: 1, away: 0 },
    phase: "1st Half · 40:00",
    latestIncident: { minute: "12'", team: "Northbridge FC", detail: "Opening goal" },
    venue: "Riverside Stadium",
    href: "/control/events",
  } satisfies DashboardMatch;

  const liveMatches = (liveEvents.map(buildMatch).filter(Boolean) as DashboardMatch[]);
  const fixtures = buildFixtures(upcomingEvents);
  const statistics = buildStatistics(liveEvents[0]);
  const operations = buildOperations(auditLogs, featuredMatch);

  return (
    <ControlCenterOverview
      league={league}
      season={season}
      featuredMatch={featuredMatch}
      liveMatches={liveMatches.length ? liveMatches : [featuredMatch]}
      upcomingMatches={fixtures.length ? fixtures : [
        { id: "a", date: "Sep 14", time: "20:30", home: { name: "Harbor City", shortName: "Harbor", code: "HBC", crest: "harbor" }, away: { name: "Stonewall Athletic", shortName: "Stonewall", code: "SWA", crest: "stonewall" }, venue: "Harbor Bowl", href: "/control/events" },
        { id: "b", date: "Sep 15", time: "18:00", home: { name: "Westfield Rovers", shortName: "Westfield", code: "WFR", crest: "westfield" }, away: { name: "AC Meridian", shortName: "Meridian", code: "ACM", crest: "meridian" }, venue: "Westfield Park", href: "/control/events" },
        { id: "c", date: "Sep 15", time: "20:00", home: { name: "Lakeside 04", shortName: "Lakeside", code: "L04", crest: "lakeside" }, away: { name: "Port Union", shortName: "Port Union", code: "PTU", crest: "portunion" }, venue: "Meridian Ground", href: "/control/events" },
      ]}
      finishedCount={finishedEvents.length || 4}
      publishedNewsCount={news.length || 2}
      statistics={statistics}
      operations={operations}
    />
  );
}
