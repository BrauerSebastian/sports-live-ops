import type { Metadata } from "next";
import Link from "next/link";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { deriveScore } from "@/lib/domain/score";
import { getActiveCompetition, getFinishedEvents, getLiveEvents, getPublicNews, getUpcomingEvents } from "@/lib/server/competition-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Center",
  description: "Live matches, fixtures, results, standings and competition news from Sports Live Ops.",
};

function resultLabel(event: Awaited<ReturnType<typeof getFinishedEvents>>[number]) {
  const home = event.participants.find((entry) => entry.side === "HOME");
  const away = event.participants.find((entry) => entry.side === "AWAY");
  if (!home || !away) return "Final";
  const score = deriveScore(event.incidents, home.participantId, away.participantId);
  return `${score.home} : ${score.away}`;
}

export default async function LivePage() {
  let data;
  try {
    data = await Promise.all([
      getActiveCompetition(),
      getLiveEvents(),
      getUpcomingEvents(4),
      getFinishedEvents(4),
      getPublicNews(3),
    ]);
  } catch {
    return <DataUnavailable title="Live Center data unavailable" />;
  }

  const [competition, liveEvents, upcomingEvents, finishedEvents, news] = data;
  const season = competition?.seasons[0];
  const primaryLiveEvent = liveEvents[0];

  return (
    <main className="public-main public-home">
      <header className="public-intro public-home-intro">
        <div>
          <p className="overline">{season ? `${competition?.name} / ${season.name}` : "Live Center"}</p>
          <h1>Live Center</h1>
          <p className="event-location">Fixtures, scores, results and published match updates.</p>
        </div>
        {primaryLiveEvent ? <Link className="public-primary-cta" href={`/live/events/${primaryLiveEvent.id}`}>Open live match</Link> : competition ? <Link className="secondary-button" href={`/live/competitions/${competition.id}`}>Competition overview</Link> : null}
      </header>

      <div className="public-dashboard-grid">
        <section className="public-home-section public-live-board">
          <div className="public-section-title"><div><span className="overline">Current matches</span><h2>Live now</h2></div><span>{liveEvents.length} active</span></div>
          {liveEvents.length
            ? liveEvents.map((event) => (
                <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}>
                  <span className="public-live-status"><span className="live-dot" aria-hidden="true" />Live</span>
                  <strong>{event.title}</strong>
                  <span className="public-minute">{event.currentMinute}&apos;</span>
                </Link>
              ))
            : <p className="public-empty">No matches are live right now.</p>}
        </section>

        <aside className="public-status-card">
          <span className="overline">Competition snapshot</span>
          <strong className="snapshot-name">{competition?.name ?? "No active competition"}</strong>
          <dl>
            <div><dt>Upcoming</dt><dd>{upcomingEvents.length}</dd></div>
            <div><dt>Finished</dt><dd>{finishedEvents.length}</dd></div>
            <div><dt>Published news</dt><dd>{news.length}</dd></div>
          </dl>
        </aside>
      </div>

      <div className="public-home-grid">
        <section className="public-home-section">
          <div className="public-section-title"><div><span className="overline">Schedule</span><h2>Upcoming</h2></div><span>Next fixtures</span></div>
          {upcomingEvents.length
            ? upcomingEvents.map((event) => (
                <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}>
                  <time>{event.scheduledAt.toISOString().slice(0, 10)}<small>{event.scheduledAt.toISOString().slice(11, 16)}</small></time>
                  <strong>{event.title}</strong>
                  <span>{event.venue.name}</span>
                </Link>
              ))
            : <p className="public-empty">No upcoming fixtures.</p>}
        </section>

        <section className="public-home-section">
          <div className="public-section-title"><div><span className="overline">Results</span><h2>Latest finals</h2></div><span>Finished</span></div>
          {finishedEvents.length
            ? finishedEvents.map((event) => (
                <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}>
                  <time>{event.scheduledAt.toISOString().slice(0, 10)}</time>
                  <strong>{event.title}</strong>
                  <span className="public-result">{resultLabel(event)}</span>
                </Link>
              ))
            : <p className="public-empty">No final results yet.</p>}
        </section>
      </div>

      <section className="public-home-section public-news-section">
        <div className="public-section-title"><div><span className="overline">Publishing</span><h2>Latest news</h2></div><span>{news.length} published</span></div>
        {news.length
          ? news.map((article) => (
              <Link className="news-row" href={`/live/news/${article.id}`} key={article.id}>
                <span className="overline">{article.publishedAt?.toISOString().slice(0, 10)}</span>
                <strong>{article.title}</strong>
                <p>{article.summary}</p>
              </Link>
            ))
          : <p className="public-empty">No published news yet.</p>}
      </section>
    </main>
  );
}
