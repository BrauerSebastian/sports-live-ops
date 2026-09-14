import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { deriveScore } from "@/lib/domain/score";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getActiveCompetition, getAttentionEvents, getAuditLogs, getLiveEvents, getUpcomingEvents } from "@/lib/server/competition-repository";
import { getCurrentUser } from "@/lib/server/require-user";

export default async function ControlPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === Role.EDITOR) redirect("/control/content");

  let data;
  try {
    data = await Promise.all([
      getActiveCompetition(),
      getLiveEvents(),
      getUpcomingEvents(5),
      getAttentionEvents(5),
      getAuditLogs(),
    ]);
  } catch {
    return <DataUnavailable />;
  }

  const [competition, liveEvents, upcomingEvents, attentionEvents, auditLogs] = data;
  const recentLogs = auditLogs.slice(0, 5);
  const liveIncidents = liveEvents.reduce((total, event) => total + event.incidents.length, 0);
  const liveComments = liveEvents.reduce((total, event) => total + event.liveComments.length, 0);

  return (
    <main className="route-page overview-page">
      <header className="route-heading overview-heading">
        <div>
          <p className="overline">{competition?.name ?? "No active competition"}</p>
          <h1>Matchday operations</h1>
          <p>{liveEvents.length} live, {upcomingEvents.length} upcoming, {attentionEvents.length} require attention.</p>
        </div>
        <Link className="secondary-button" href="/control/events">View all matches</Link>
      </header>

      <div className="overview-board">
        <section className="overview-primary route-section">
          <div className="section-heading">
            <div>
              <span className="overline">Live matches</span>
              <h2>{liveEvents.length ? "In progress" : "No match is live"}</h2>
            </div>
            <span className="section-meta">{liveEvents.length} active</span>
          </div>

          <div className="current-match-list">
            {liveEvents.length ? liveEvents.map((event) => {
              const home = event.participants.find((entry) => entry.side === "HOME");
              const away = event.participants.find((entry) => entry.side === "AWAY");
              const score = home && away ? deriveScore(event.incidents, home.participantId, away.participantId) : null;
              return (
                <Link className="current-match-row" href={`/control/events/${event.id}`} key={event.id}>
                  <span className="current-match-state"><span className="live-dot" aria-hidden="true" />Live</span>
                  <span className="current-match-teams">
                    <strong>{event.title}</strong>
                    <small>{event.venue.name}</small>
                  </span>
                  <span className="current-match-minute">{event.currentMinute}&apos;</span>
                  <span className="current-match-score">{score ? `${score.home} : ${score.away}` : "Open"}</span>
                </Link>
              );
            }) : (
              <div className="overview-empty-state">
                <strong>No active match</strong>
                <span>Open Matches to review the next scheduled fixture.</span>
              </div>
            )}
          </div>

          <div className="overview-metrics" aria-label="Live match totals">
            <div><span>Incidents</span><strong>{liveIncidents}</strong></div>
            <div><span>Commentary</span><strong>{liveComments}</strong></div>
            <div><span>Upcoming</span><strong>{upcomingEvents.length}</strong></div>
          </div>
        </section>

        <aside className="overview-rail">
          <section className="operations-summary-card">
            <div className="summary-heading">
              <span className="overline">Operations status</span>
              <span className={attentionEvents.length ? "summary-state warning" : "summary-state clear"}>{attentionEvents.length ? "Review needed" : "Clear"}</span>
            </div>
            <dl>
              <div><dt>Live matches</dt><dd>{liveEvents.length}</dd></div>
              <div><dt>Upcoming</dt><dd>{upcomingEvents.length}</dd></div>
              <div><dt>Needs action</dt><dd>{attentionEvents.length}</dd></div>
              <div><dt>Competition</dt><dd>{competition ? "Active" : "Not set"}</dd></div>
            </dl>
          </section>

          <section className="queue-panel">
            <div className="queue-heading"><span>Operator queue</span><strong>{attentionEvents.length}</strong></div>
            {attentionEvents.length ? (
              <div className="queue-list">
                {attentionEvents.map((event) => (
                  <Link href={`/control/events/${event.id}`} key={event.id}>
                    <span>{event.title}</span>
                    <small>{event.status.replace("_", " ")}</small>
                  </Link>
                ))}
              </div>
            ) : <p className="queue-empty">No paused or delayed matches require action.</p>}
          </section>
        </aside>
      </div>

      <div className="overview-lower-grid">
        <section className="route-section upcoming-panel">
          <div className="section-heading">
            <div><span className="overline">Schedule</span><h2>Upcoming matches</h2></div>
            <Link className="section-meta" href="/control/events">All matches</Link>
          </div>
          {upcomingEvents.length ? upcomingEvents.map((event) => (
            <Link className="event-row compact-event-row" href={`/control/events/${event.id}`} key={event.id}>
              <span className="event-time"><strong>{event.scheduledAt.toISOString().slice(11, 16)}</strong><small>{event.scheduledAt.toISOString().slice(0, 10)}</small></span>
              <span className="event-match">{event.participants.map((entry) => <strong key={entry.participantId}>{entry.participant.name}</strong>)}</span>
              <span className="row-action">Open</span>
            </Link>
          )) : <p className="route-empty">No upcoming matches.</p>}
        </section>

        <section className="route-section activity-panel">
          <div className="section-heading">
            <div><span className="overline">Audit</span><h2>Recent operations</h2></div>
            <Link className="section-meta" href="/control/audit">Full log</Link>
          </div>
          {recentLogs.length ? recentLogs.map((log) => (
            <div className="event-row compact-event-row" key={log.id}>
              <span className="event-time"><strong>{log.createdAt.toISOString().slice(11, 16)}</strong><small>{log.createdAt.toISOString().slice(0, 10)}</small></span>
              <span className="event-match"><strong>{log.action.replaceAll("_", " ")}</strong><small>{log.event?.title ?? log.entityType}</small></span>
              <span className="event-meta">{log.actor?.displayName ?? "System"}</span>
            </div>
          )) : <p className="route-empty">No recent audit activity.</p>}
        </section>
      </div>
    </main>
  );
}
