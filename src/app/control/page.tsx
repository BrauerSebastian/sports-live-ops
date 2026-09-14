import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getActiveCompetition, getAttentionEvents, getAuditLogs, getLiveEvents, getUpcomingEvents } from "@/lib/server/competition-repository";
import { getCurrentUser } from "@/lib/server/require-user";

export default async function ControlPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === Role.EDITOR) redirect("/control/content");
  let data;
  try { data = await Promise.all([getActiveCompetition(), getLiveEvents(), getUpcomingEvents(5), getAttentionEvents(5), getAuditLogs()]); }
  catch { return <DataUnavailable />; }
  const [competition, liveEvents, upcomingEvents, attentionEvents, auditLogs] = data;
  const recentLogs = auditLogs.slice(0, 5);

  return <main className="route-page">
    <header className="route-heading"><div><p className="overline">Control Room / Overview</p><h1>Matchday operations</h1><p>{competition?.name ?? "No active competition"} / What is live, next, and needs action.</p></div><Link className="secondary-button" href="/control/events">All events</Link></header>

    <section className="route-section"><div className="section-heading"><div><span className="live-label">Live now</span><h2>{liveEvents.length ? `${liveEvents.length} event${liveEvents.length === 1 ? "" : "s"} in progress` : "No live events"}</h2></div></div>{liveEvents.length ? liveEvents.map((event) => <Link className="event-row featured-event" href={`/control/events/${event.id}`} key={event.id}><span className="event-time"><span className="live-pulse" />{event.currentMinute}:00<span className="event-status">{event.status}</span></span><span className="event-match">{event.participants.map((entry) => <strong key={entry.participantId}>{entry.participant.name}</strong>)}</span><span className="event-meta">{event.venue.name}<br />{event.competition.name}</span><span className="row-action">Open event</span></Link>) : <p className="route-empty">Nothing is live right now.</p>}</section>

    <section className="overview-columns">
      <section className="route-section"><div className="section-heading"><div><span className="overline">Next on the schedule</span><h2>Upcoming events</h2></div><span className="section-meta">{upcomingEvents.length} shown</span></div>{upcomingEvents.length ? upcomingEvents.map((event) => <Link className="event-row" href={`/control/events/${event.id}`} key={event.id}><span className="event-time"><strong>{event.scheduledAt.toISOString().slice(11, 16)}</strong><span className="event-status">{event.status}</span></span><span className="event-match">{event.participants.map((entry) => <strong key={entry.participantId}>{entry.participant.name}</strong>)}</span><span className="event-meta">{event.venue.name}</span><span className="row-action">Details</span></Link>) : <p className="route-empty">No upcoming events.</p>}</section>
      <section className="route-section"><div className="section-heading"><div><span className="overline">Operator attention</span><h2>Needs action</h2></div><span className="section-meta">{attentionEvents.length}</span></div>{attentionEvents.length ? attentionEvents.map((event) => <Link className="event-row" href={`/control/events/${event.id}`} key={event.id}><span className="event-time"><strong>{event.status.replace("_", " ")}</strong><small>{event.currentMinute}:00</small></span><span className="event-match"><strong>{event.title}</strong></span><span className="event-meta">{event.venue.name}</span><span className="row-action">Review</span></Link>) : <p className="route-empty">No paused or delayed events require attention.</p>}</section>
    </section>

    <section className="route-section"><div className="section-heading"><div><span className="overline">System activity</span><h2>Recent operations</h2></div><Link className="section-meta" href="/control/audit">Full audit log</Link></div>{recentLogs.length ? recentLogs.map((log) => <div className="event-row" key={log.id}><span className="event-time"><strong>{log.createdAt.toISOString().slice(11, 16)}</strong><small>{log.createdAt.toISOString().slice(0, 10)}</small></span><span className="event-match"><strong>{log.action.replaceAll("_", " ")}</strong><small>{log.event?.title ?? log.entityType}</small></span><span className="event-meta">{log.actor?.displayName ?? "System"}</span><span className="row-action">{log.entityType}</span></div>) : <p className="route-empty">No recent audit activity.</p>}</section>
  </main>;
}
