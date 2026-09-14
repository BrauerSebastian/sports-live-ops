import type { ReactNode } from "react";
import Link from "next/link";

type View = "overview" | "event" | "live";

export function OperationsShell({ activeView, onNavigate, children }: { activeView: View; onNavigate: (view: View) => void; children: ReactNode }) {
  return (
    <main className="ops-shell">
      <header className="global-header">
        <button className="wordmark" onClick={() => onNavigate("event")} aria-label="Sports Live Ops home"><span className="wordmark-mark">S</span><span>SPORTS LIVE OPS</span></button>
        <div className="header-context"><span>North American League</span><span className="header-divider">/</span><strong>Matchday 08</strong></div>
        <div className="header-utilities"><span className="system-state"><span className="state-light" /> Systems nominal</span><span className="operator">Jordan Mitchell <span className="operator-initials">JM</span></span></div>
      </header>
      <div className="ops-body">
        <nav className="compact-nav" aria-label="Operations navigation">
          <div className="nav-group"><span className="nav-group-label">Operations</span><Link className={activeView === "overview" ? "nav-link current" : "nav-link"} href="/control">Overview</Link><Link className={activeView === "event" ? "nav-link current" : "nav-link"} href="/control/events">Live events <span className="nav-badge">1</span></Link><Link className="nav-link" href="/control/competitions">Competitions</Link></div>
          <div className="nav-group"><span className="nav-group-label">Publishing</span><Link className={activeView === "live" ? "nav-link current" : "nav-link"} href="/live">Live Center</Link><Link className="nav-link" href="/control/content">Content</Link><Link className="nav-link" href="/control/notifications">Notifications</Link></div>
          <div className="nav-group"><span className="nav-group-label">System</span><Link className="nav-link" href="/control/audit">Audit log</Link></div>
          <div className="nav-footer"><span className="state-light" /> Connected to live feed</div>
        </nav>
        <section className="ops-main">{children}</section>
      </div>
    </main>
  );
}

