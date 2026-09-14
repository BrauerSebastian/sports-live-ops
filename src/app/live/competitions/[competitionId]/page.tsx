import Link from "next/link";
import { notFound } from "next/navigation";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getCompetitionById } from "@/lib/server/competition-repository";

export default async function PublicCompetitionPage({ params }: { params: Promise<{ competitionId: string }> }) {
  let competition;
  try { competition = await getCompetitionById((await params).competitionId); } catch { return <DataUnavailable title="Competition data unavailable" />; }
  if (!competition) notFound();
  return <div className="public-view"><header className="public-header"><div className="public-wordmark">SPORTS LIVE OPS <span>/ LIVE CENTER</span></div><Link className="follow-button" href="/live">Live Center</Link></header><main className="public-main"><div className="public-intro"><div><p className="overline">Competition / {competition.region}</p><h1>{competition.name}</h1><p className="event-location">{competition.seasons[0]?.name} / {competition.participants.length} participants</p></div></div><div className="public-tabs"><button className="active">Overview</button><Link href={`/live/competitions/${competition.id}/fixtures`}>Fixtures and results</Link><button>Standings</button></div><div className="public-content"><section><div className="public-section-title"><h2>Fixtures</h2><span>{competition.events.length} events</span></div>{competition.events.map((event) => <Link className="public-event-row" href={`/live/events/${event.id}`} key={event.id}><time>{event.scheduledAt.toISOString().slice(0, 10)}</time><strong>{event.title}</strong><span>{event.status}</span></Link>)}</section><aside><div className="public-section-title"><h2>Participants</h2><span>Registered</span></div>{competition.participants.map(({ participant }) => <div className="public-note" key={participant.id}><strong>{participant.name}</strong><p>{participant.shortName}</p></div>)}</aside></div></main></div>;
}
