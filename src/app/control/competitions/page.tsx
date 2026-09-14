import Link from "next/link";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getCompetitions } from "@/lib/server/competition-repository";

export default async function CompetitionsPage() {
  let competitions;
  try { competitions = await getCompetitions(); } catch { return <DataUnavailable title="Competition data unavailable" />; }
  return <main className="route-page"><header className="route-heading"><div><p className="overline">Control Room / Competitions</p><h1>Competitions</h1><p>Review seasons, participants, fixtures, and standings.</p></div></header><section className="route-section event-table"><div className="event-table-head"><span>Competition</span><span>Active season</span><span>Events</span><span>Participants</span><span /></div>{competitions.length ? competitions.map((competition) => <Link className="event-table-row" href={`/control/competitions/${competition.id}`} key={competition.id}><span><strong>{competition.name}</strong><small>{competition.region} / {competition.sport}</small></span><span className="event-meta">{competition.seasons[0]?.name ?? "No active season"}</span><span>{competition._count.events}</span><span>{competition._count.participants}</span><span className="row-action">Open</span></Link>) : <p className="route-empty">No competitions are configured.</p>}</section></main>;
}
