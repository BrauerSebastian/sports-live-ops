import Link from "next/link";
import { notFound } from "next/navigation";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getCompetitionById } from "@/lib/server/competition-repository";

export default async function PublicFixturesPage({ params }: { params: Promise<{ competitionId: string }> }) {
  let competition;
  try { competition = await getCompetitionById((await params).competitionId); } catch { return <DataUnavailable title="Fixture data unavailable" />; }
  if (!competition) notFound();
  return <div className="public-view"><header className="public-header"><div className="public-wordmark">SPORTS LIVE OPS <span>/ LIVE CENTER</span></div><Link className="follow-button" href={`/live/competitions/${competition.id}`}>Competition</Link></header><main className="public-main"><div className="public-intro"><div><p className="overline">{competition.name} / Fixtures and results</p><h1>Fixtures and results</h1><p className="event-location">{competition.seasons[0]?.name}</p></div></div><div className="filter-bar"><button className="filter-active">All</button><button>Upcoming</button><button>Live</button><button>Finished</button></div><section className="public-home-section">{competition.events.map((event) => <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}><time>{event.scheduledAt.toISOString().slice(0, 10)}</time><strong>{event.title}</strong><span>{event.status}</span></Link>)}</section></main></div>;
}
