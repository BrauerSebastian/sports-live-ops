"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Role = "ADMIN" | "OPERATOR" | "EDITOR";
type ShellUser = { name: string; role: Role };

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
}

function navClass(pathname: string, href: string, exact = false) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return active ? "nav-link current" : "nav-link";
}

export function OperationsShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const pathname = usePathname();
  const canOperate = user.role === "ADMIN" || user.role === "OPERATOR";
  const canEditContent = user.role === "ADMIN" || user.role === "EDITOR";
  const canInspectSystem = user.role !== "EDITOR";

  return (
    <main className="ops-shell">
      <header className="global-header">
        <Link className="wordmark" href="/control" aria-label="Sports Live Ops home">
          <span className="wordmark-mark">S</span><span>SPORTS LIVE OPS</span>
        </Link>
        <div className="header-context"><span>Operations workspace</span><span className="header-divider">/</span><strong>{user.role.toLowerCase()}</strong></div>
        <div className="header-utilities">
          <span className="system-state"><span className="state-light" /> Authenticated</span>
          <span className="operator">{user.name} <span className="operator-initials">{initials(user.name)}</span></span>
        </div>
      </header>
      <div className="ops-body">
        <nav className="compact-nav" aria-label="Operations navigation">
          <div className="nav-group">
            <span className="nav-group-label">Operations</span>
            {canOperate && <Link className={navClass(pathname, "/control", true)} href="/control">Overview</Link>}
            {canOperate && <Link className={navClass(pathname, "/control/events")} href="/control/events">Events</Link>}
            <Link className={navClass(pathname, "/control/competitions")} href="/control/competitions">Competitions</Link>
          </div>
          <div className="nav-group">
            <span className="nav-group-label">Publishing</span>
            <Link className="nav-link" href="/live">Live Center</Link>
            {canEditContent && <Link className={navClass(pathname, "/control/content")} href="/control/content">Content</Link>}
            {canInspectSystem && <Link className={navClass(pathname, "/control/notifications")} href="/control/notifications">Notifications</Link>}
          </div>
          {canInspectSystem && <div className="nav-group"><span className="nav-group-label">System</span><Link className={navClass(pathname, "/control/audit")} href="/control/audit">Audit log</Link></div>}
          <div className="nav-footer"><span><span className="state-light" /> {user.role.toLowerCase()} session</span><button type="button" className="nav-signout" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button></div>
        </nav>
        <section className="ops-main">{children}</section>
      </div>
    </main>
  );
}
