import type { ReactNode } from "react";

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
          <div className="nav-group"><span className="nav-group-label">Operations</span><button className={activeView === "overview" ? "nav-link current" : "nav-link"} onClick={() => onNavigate("overview")}>Overview</button><button className={activeView === "event" ? "nav-link current" : "nav-link"} onClick={() => onNavigate("event")}>Live events <span className="nav-badge">1</span></button><button className="nav-link">Competitions</button></div>
          <div className="nav-group"><span className="nav-group-label">Publishing</span><button className={activeView === "live" ? "nav-link current" : "nav-link"} onClick={() => onNavigate("live")}>Live Center</button><button className="nav-link">Content</button><button className="nav-link">Notifications</button></div>
          <div className="nav-group"><span className="nav-group-label">System</span><button className="nav-link">Audit log</button></div>
          <div className="nav-footer"><span className="state-light" /> Connected to live feed</div>
        </nav>
        <section className="ops-main">{children}</section>
      </div>
    </main>
  );
}

