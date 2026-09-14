import Link from "next/link";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getEvents } from "@/lib/server/competition-repository";

const statuses = ["ALL", "SCHEDULED", "LIVE", "PAUSED", "FINISHED", "DELAYED", "CANCELLED"];

export default async function EventsPage() {
  let events;
  try { events = await getEvents(); }
  catch { return <DataUnavailable title="Events data unavailable" />; }
  return <main className="route-page"><header className="route-heading"><div><p className="overline">Control Room / Events</p><h1>All events</h1><p>Every fixture across the active competition season.</p></div><Link className="secondary-button" href="/control">Back to overview</Link></header><div className="filter-bar">{statuses.map((status, index) => <button className={index === 0 ? "filter-active" : ""} key={status}>{status}</button>)}</div><section className="route-section event-table"><div className="event-table-head"><span>Start</span><span>Event</span><span>Competition / Venue</span><span>Status</span><span /></div>{events.map((event) => <Link className="event-table-row" href={`/control/events/${event.id}`} key={event.id}><span className="event-time"><strong>{event.scheduledAt.toISOString().slice(0, 10)}</strong><small>{event.scheduledAt.toISOString().slice(11, 16)}</small></span><span className="event-match">{event.participants.map((entry) => <strong key={entry.participantId}>{entry.participant.name}</strong>)}</span><span className="event-meta">{event.competition.name}<br />{event.venue.name}</span><span className={`status-text ${event.status.toLowerCase()}`}>{event.status.replace("_", " ")}</span><span className="row-action">Open</span></Link>)}</section></main>;
}
