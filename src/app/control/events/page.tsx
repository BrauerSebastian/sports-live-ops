import Link from "next/link";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getEvents } from "@/lib/server/competition-repository";
import { EventStatus } from "@prisma/client";

const statuses = ["ALL", "SCHEDULED", "PRE_LIVE", "LIVE", "PAUSED", "FINISHED", "DELAYED", "CANCELLED"];

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ status?: string; competitionId?: string }> }) {
  const query = await searchParams;
  const selected = query.status;
  const status = selected && selected !== "ALL" && Object.values(EventStatus).includes(selected as EventStatus) ? selected as EventStatus : undefined;
  let events;
  try { events = await getEvents(status, query.competitionId); }
  catch { return <DataUnavailable title="Events data unavailable" />; }
  const competitionSuffix = query.competitionId ? `&competitionId=${encodeURIComponent(query.competitionId)}` : "";

  return <main className="route-page"><header className="route-heading"><div><p className="overline">Control Room / Events</p><h1>All events</h1><p>{query.competitionId ? "Filtered to the selected competition." : "Every fixture across the active competition season."}</p></div><Link className="secondary-button" href="/control">Back to overview</Link></header><div className="filter-bar">{statuses.map((filter) => <Link className={(!status && filter === "ALL") || status === filter ? "filter-active" : ""} href={filter === "ALL" ? `/control/events${query.competitionId ? `?competitionId=${encodeURIComponent(query.competitionId)}` : ""}` : `/control/events?status=${filter}${competitionSuffix}`} key={filter}>{filter.replace("_", " ")}</Link>)}</div><section className="route-section event-table"><div className="event-table-head"><span>Start</span><span>Event</span><span>Competition / Venue</span><span>Status</span><span /></div>{events.length ? events.map((event) => <Link className="event-table-row" href={`/control/events/${event.id}`} key={event.id}><span className="event-time"><strong>{event.scheduledAt.toISOString().slice(0, 10)}</strong><small>{event.scheduledAt.toISOString().slice(11, 16)}</small></span><span className="event-match">{event.participants.map((entry) => <strong key={entry.participantId}>{entry.participant.name}</strong>)}</span><span className="event-meta">{event.competition.name}<br />{event.venue.name}</span><span className={`status-text ${event.status.toLowerCase()}`}>{event.status.replace("_", " ")}</span><span className="row-action">Open</span></Link>) : <p className="route-empty">No events match this filter.</p>}</section></main>;
}
