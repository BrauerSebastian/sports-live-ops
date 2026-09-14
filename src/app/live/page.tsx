import Link from "next/link";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { deriveScore } from "@/lib/domain/score";
import { getActiveCompetition, getFinishedEvents, getLiveEvents, getPublicNews, getUpcomingEvents } from "@/lib/server/competition-repository";

export const dynamic = "force-dynamic";

function resultLabel(event: Awaited<ReturnType<typeof getFinishedEvents>>[number]) {
  const home = event.participants.find((entry) => entry.side === "HOME");
  const away = event.participants.find((entry) => entry.side === "AWAY");
  if (!home || !away) return "Final";
  const score = deriveScore(event.incidents, home.participantId, away.participantId);
  return `${score.home} - ${score.away}`;
}

export default async function LivePage() {
  let data;
  try { data = await Promise.all([getActiveCompetition(), getLiveEvents(), getUpcomingEvents(4), getFinishedEvents(4), getPublicNews(3)]); }
  catch { return <DataUnavailable title="Live Center data unavailable" />; }
  const [competition, liveEvents, upcomingEvents, finishedEvents, news] = data;
  const season = competition?.seasons[0];

  return <div className="public-view">
    <header className="public-header"><Link className="public-wordmark" href="/live">SPORTS LIVE OPS <span>/ LIVE CENTER</span></Link><span className="public-competition">{competition?.name ?? "No active competition"}</span><Link className="follow-button" href="/login">Control Room</Link></header>
    <main className="public-main public-home">
      <header className="public-intro"><div><p className="overline">{competition ? `${competition.name}${season ? ` / ${season.name}` : ""}` : "Live Center"}</p><h1>Live competition, clearly reported.</h1><p className="event-location">Scores, events, and the latest from across the league.</p></div>{competition && <Link className="secondary-button" href={`/live/competitions/${competition.id}`}>Competition</Link>}</header>

      <section className="public-home-section"><div className="public-section-title"><h2>Live now</h2><span>{liveEvents.length} active</span></div>{liveEvents.length ? liveEvents.map((event) => <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}><span className="public-live-status"><span className="state-light" />{event.currentMinute}:00</span><strong>{event.title}</strong><span>Open live event</span></Link>) : <p className="public-empty">No events are live right now.</p>}</section>

      <div className="public-home-grid">
        <section className="public-home-section"><div className="public-section-title"><h2>Upcoming</h2><span>Next fixtures</span></div>{upcomingEvents.length ? upcomingEvents.map((event) => <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}><time>{event.scheduledAt.toISOString().slice(0, 10)} · {event.scheduledAt.toISOString().slice(11, 16)}</time><strong>{event.title}</strong><span>{event.venue.name}</span></Link>) : <p className="public-empty">No upcoming fixtures.</p>}</section>
        <section className="public-home-section"><div className="public-section-title"><h2>Latest results</h2><span>Finished</span></div>{finishedEvents.length ? finishedEvents.map((event) => <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}><time>{event.scheduledAt.toISOString().slice(0, 10)}</time><strong>{event.title}</strong><span>{resultLabel(event)}</span></Link>) : <p className="public-empty">No final results yet.</p>}</section>
      </div>

      <section className="public-home-section"><div className="public-section-title"><h2>Latest news</h2><span>From the competition desk</span></div>{news.length ? news.map((article) => <Link className="news-row" href={`/live/news/${article.id}`} key={article.id}><span className="overline">{article.publishedAt?.toISOString().slice(0, 10)}</span><strong>{article.title}</strong><p>{article.summary}</p></Link>) : <p className="public-empty">No published news yet.</p>}</section>
    </main>
  </div>;
}
