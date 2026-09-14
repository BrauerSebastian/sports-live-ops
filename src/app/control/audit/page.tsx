import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getAuditLogs } from "@/lib/server/competition-repository";

export default async function AuditPage() {
  let logs;
  try { logs = await getAuditLogs(); } catch { return <DataUnavailable title="Audit data unavailable" />; }
  return <main className="route-page"><header className="route-heading"><div><p className="overline">Control Room / System</p><h1>Audit log</h1><p>Significant operator and system mutations.</p></div></header><section className="route-section event-table"><div className="event-table-head"><span>Time</span><span>Action</span><span>Entity</span><span>Actor</span><span /></div>{logs.map((log) => <div className="event-table-row" key={log.id}><span className="event-time"><strong>{log.createdAt.toISOString().slice(0, 10)}</strong><small>{log.createdAt.toISOString().slice(11, 16)}</small></span><span><strong>{log.action}</strong></span><span className="event-meta">{log.entityType}<br />{log.entityId.slice(0, 12)}</span><span className="event-meta">{log.actor?.displayName ?? "System"}</span><span /></div>)}</section></main>;
}
