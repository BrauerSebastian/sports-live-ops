import Link from "next/link";
import { notFound } from "next/navigation";
import { EventStatus } from "@prisma/client";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { deriveScore } from "@/lib/domain/score";
import { getCompetitionById } from "@/lib/server/competition-repository";

export const dynamic = "force-dynamic";

const filters = [
  { label: "All", value: "" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Live", value: "LIVE" },
  { label: "Finished", value: "FINISHED" },
] as const;

function matchesFilter(status: EventStatus, selected?: string) {
  if (!selected) return true;
  if (selected === "LIVE") return status === EventStatus.LIVE || status === EventStatus.PAUSED;
  if (selected === "UPCOMING") return status === EventStatus.SCHEDULED || status === EventStatus.PRE_LIVE || status === EventStatus.DELAYED;
  if (selected === "FINISHED") return status === EventStatus.FINISHED;
  return true;
}

export default async function PublicFixturesPage({ params, searchParams }: { params: Promise<{ competitionId: string }>; searchParams: Promise<{ status?: string }> }) {
  let competition;
  try { competition = await getCompetitionById((await params).competitionId); }
  catch { return <DataUnavailable title="Fixture data unavailable" />; }
  if (!competition) notFound();

  const selected = (await searchParams).status;
  const events = competition.events.filter((event) => matchesFilter(event.status, selected));

  return <div className="public-view">
    <header className="public-header">
      <Link className="public-wordmark" href="/live">SPORTS LIVE OPS <span>/ LIVE CENTER</span></Link>
      <Link className="follow-button" href={`/live/competitions/${competition.id}`}>Competition</Link>
    </header>
    <main className="public-main">
      <div className="public-intro"><div><p className="overline">{competition.name} / Fixtures and results</p><h1>Fixtures and results</h1><p className="event-location">{competition.seasons[0]?.name}</p></div></div>
      <div className="filter-bar" aria-label="Fixture filters">{filters.map((filter) => <Link className={selected === filter.value || (!selected && !filter.value) ? "filter-active" : ""} href={filter.value ? `?status=${filter.value}` : "?"} key={filter.label}>{filter.label}</Link>)}</div>
      <section className="public-home-section">
        {events.length ? events.map((event) => {
          const home = event.participants.find((entry) => entry.side === "HOME");
          const away = event.participants.find((entry) => entry.side === "AWAY");
          const score = home && away ? deriveScore(event.incidents, home.participantId, away.participantId) : null;
          const isLive = event.status === EventStatus.LIVE || event.status === EventStatus.PAUSED;
          const state = event.status === EventStatus.FINISHED && score ? `${score.home} - ${score.away}` : isLive && score ? `${score.home} - ${score.away} / ${event.currentMinute}'` : event.status.replace("_", " ");
          return <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}>
            <time>{event.scheduledAt.toISOString().slice(0, 10)}<small>{event.scheduledAt.toISOString().slice(11, 16)} UTC</small></time>
            <strong>{event.title}<small>{event.venue.name}</small></strong>
            <span className={isLive ? "public-live-status" : ""}>{isLive && <span className="state-light" />}{state}</span>
          </Link>;
        }) : <p className="public-empty">No fixtures match this filter.</p>}
      </section>
    </main>
  </div>;
}
