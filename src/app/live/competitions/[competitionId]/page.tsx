import type { Metadata } from "next";
import Link from "next/link";
import { EventStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { deriveScore } from "@/lib/domain/score";
import { getCompetitionById } from "@/lib/server/competition-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ competitionId: string }> }): Promise<Metadata> {
  try {
    const competition = await getCompetitionById((await params).competitionId);
    if (!competition) return { title: "Competition not found" };
    return {
      title: competition.name,
      description: `Fixtures, live events, standings and news for ${competition.name}.`,
      alternates: { canonical: `/live/competitions/${competition.id}` },
    };
  } catch {
    return { title: "Competition" };
  }
}

export default async function PublicCompetitionPage({ params }: { params: Promise<{ competitionId: string }> }) {
  let competition;
  try { competition = await getCompetitionById((await params).competitionId); } catch { return <DataUnavailable title="Competition data unavailable" />; }
  if (!competition) notFound();

  const season = competition.seasons[0];
  const liveEvents = competition.events.filter((event) => event.status === EventStatus.LIVE || event.status === EventStatus.PAUSED);
  const upcomingEvents = competition.events.filter((event) => event.status === EventStatus.SCHEDULED || event.status === EventStatus.PRE_LIVE || event.status === EventStatus.DELAYED).slice(0, 4);

  return (
    <main className="public-main">
      <div className="public-intro">
        <div>
          <p className="overline">Competition / {competition.region}</p>
          <h1>{competition.name}</h1>
          <p className="event-location">{season?.name} / {competition.participants.length} participants</p>
        </div>
        <Link className="public-primary-cta" href={`/live/competitions/${competition.id}/fixtures`}>View fixtures</Link>
      </div>

      <div className="public-tabs" aria-label="Competition sections">
        <Link className="active" href={`/live/competitions/${competition.id}`}>Overview</Link>
        <Link href={`/live/competitions/${competition.id}/fixtures`}>Fixtures and results</Link>
      </div>

      {liveEvents.length > 0 && (
        <section className="public-home-section public-section-spaced">
          <div className="public-section-title"><h2>Live now</h2><span>{liveEvents.length} active</span></div>
          {liveEvents.map((event) => {
            const home = event.participants.find((entry) => entry.side === "HOME");
            const away = event.participants.find((entry) => entry.side === "AWAY");
            const score = home && away ? deriveScore(event.incidents, home.participantId, away.participantId) : null;
            return (
              <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}>
                <span className="public-live-status"><span className="live-dot" aria-hidden="true" />{event.currentMinute}&apos;</span>
                <strong>{event.title}</strong>
                <span>{score ? `${score.home} : ${score.away}` : event.venue.name}</span>
              </Link>
            );
          })}
        </section>
      )}

      <div className="public-content public-section-spaced">
        <section>
          <div className="public-section-title"><h2>Standings</h2><span>{season?.standings.length ?? 0} teams</span></div>
          <div className="standing-table public-standing">
            <div className="standing-head"><span>#</span><span>Team</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GF</span><span>GA</span><span>GD</span><span>Pts</span></div>
            {season?.standings.map((standing, index) => (
              <div className="standing-row" key={standing.id}>
                <span>{index + 1}</span><strong>{standing.participant.shortName}</strong><span>{standing.played}</span><span>{standing.wins}</span><span>{standing.draws}</span><span>{standing.losses}</span><span>{standing.goalsFor}</span><span>{standing.goalsAgainst}</span><span>{standing.goalDifference}</span><strong>{standing.points}</strong>
              </div>
            ))}
          </div>
        </section>
        <aside>
          <div className="public-section-title"><h2>Next fixtures</h2><Link href={`/live/competitions/${competition.id}/fixtures`}>Full schedule</Link></div>
          {upcomingEvents.length
            ? upcomingEvents.map((event) => (
                <Link className="public-note" href={`/live/events/${event.id}`} key={event.id}>
                  <time>{event.scheduledAt.toISOString().slice(0, 10)}</time>
                  <p><strong>{event.title}</strong><br />{event.venue.name}</p>
                </Link>
              ))
            : <p className="public-empty">No upcoming fixtures.</p>}
        </aside>
      </div>

      <section className="public-home-section public-section-spaced">
        <div className="public-section-title"><h2>Competition news</h2><span>{competition.newsArticles.length} published</span></div>
        {competition.newsArticles.length
          ? competition.newsArticles.map((article) => (
              <Link className="news-row" href={`/live/news/${article.id}`} key={article.id}>
                <span className="overline">{article.publishedAt?.toISOString().slice(0, 10)}</span>
                <strong>{article.title}</strong>
                <p>{article.summary}</p>
              </Link>
            ))
          : <p className="public-empty">No published competition news.</p>}
      </section>
    </main>
  );
}
