import Link from "next/link";
import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getAuditLogs } from "@/lib/server/competition-repository";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ actor?: string; action?: string; entity?: string; date?: string }> }) {
  const query = await searchParams;
  let logs;
  try { logs = await getAuditLogs({ actor: query.actor?.trim() || undefined, action: query.action?.trim() || undefined, entityType: query.entity?.trim() || undefined, date: query.date || undefined }); }
  catch { return <DataUnavailable title="Audit data unavailable" />; }
  const filtering = Boolean(query.actor || query.action || query.entity || query.date);

  return <main className="route-page">
    <header className="route-heading"><div><p className="overline">Control Room / System</p><h1>Audit log</h1><p>Significant operator and system mutations.</p></div>{filtering && <Link className="secondary-button" href="/control/audit">Clear filters</Link>}</header>
    <form className="audit-filters" method="get"><label>Actor<input name="actor" defaultValue={query.actor ?? ""} placeholder="name or email" /></label><label>Action<input name="action" defaultValue={query.action ?? ""} placeholder="EVENT, ARTICLE..." /></label><label>Entity<input name="entity" defaultValue={query.entity ?? ""} placeholder="SportEvent" /></label><label>Date<input type="date" name="date" defaultValue={query.date ?? ""} /></label><button className="secondary-button" type="submit">Filter</button></form>
    <section className="route-section event-table event-table--audit"><div className="event-table-head"><span>Time</span><span>Action</span><span>Entity</span><span>Actor</span><span>Event</span></div>{logs.length ? logs.map((log) => <div className="event-table-row" key={log.id}><span className="event-time"><strong>{log.createdAt.toISOString().slice(0, 10)}</strong><small>{log.createdAt.toISOString().slice(11, 19)}</small></span><span><strong>{log.action}</strong></span><span className="event-meta">{log.entityType}<br />{log.entityId.slice(0, 12)}</span><span className="event-meta">{log.actor?.displayName ?? "System"}</span><span className="event-meta">{log.event?.title ?? "-"}</span></div>) : <p className="route-empty">No audit entries match these filters.</p>}</section>
  </main>;
}
