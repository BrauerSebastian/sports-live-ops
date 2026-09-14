import { DataUnavailable } from "@/components/system/DataUnavailable";
import { getNotificationOutbox } from "@/lib/server/competition-repository";
import { ProcessNotifications } from "@/components/notifications/ProcessNotifications";

export default async function NotificationsPage() {
  let notifications;
  try { notifications = await getNotificationOutbox(); } catch { return <DataUnavailable title="Notification data unavailable" />; }
  return <main className="route-page"><header className="route-heading"><div><p className="overline">Control Room / Publishing</p><h1>Notification outbox</h1><p>Inspectable delivery records for future push, email, and SMS adapters.</p></div><ProcessNotifications /></header><section className="route-section event-table"><div className="event-table-head"><span>Created</span><span>Type</span><span>Audience</span><span>Status</span><span>Source</span></div>{notifications.length ? notifications.map((notification) => <div className="event-table-row" key={notification.id}><span className="event-time"><strong>{notification.createdAt.toISOString().slice(0, 10)}</strong><small>{notification.createdAt.toISOString().slice(11, 16)}</small></span><span><strong>{notification.type}</strong></span><span className="event-meta">{notification.audience}</span><span className={`status-text ${notification.status.toLowerCase()}`}>{notification.status}</span><span className="event-meta">{notification.event?.title ?? notification.createdBy?.displayName ?? "System"}</span></div>) : <p className="route-empty">The notification outbox is empty.</p>}</section></main>;
}
