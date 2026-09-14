"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Role = "ADMIN" | "OPERATOR" | "EDITOR";
export type ShellUser = { name: string; role: Role };

function isCurrent(pathname: string, href: string, exact = false) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function navClass(pathname: string, href: string, exact = false) {
  return isCurrent(pathname, href, exact) ? "nav-link current" : "nav-link";
}

function sectionLabel(pathname: string) {
  if (pathname.startsWith("/live/events")) return "Live match";
  if (pathname.startsWith("/live/competitions")) return "Competition";
  if (pathname.startsWith("/live/news")) return "News";
  if (pathname.startsWith("/live")) return "Live Center";
  if (pathname.startsWith("/control/events")) return "Matches";
  if (pathname.startsWith("/control/competitions")) return "Competitions";
  if (pathname.startsWith("/control/content")) return "Content";
  if (pathname.startsWith("/control/notifications")) return "Notifications";
  if (pathname.startsWith("/control/audit")) return "Audit log";
  return "Overview";
}

export function AppShell({ user, children }: { user?: ShellUser | null; children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname.startsWith("/live");
  const canOperate = !user || user.role === "ADMIN" || user.role === "OPERATOR";
  const canEditContent = Boolean(user && (user.role === "ADMIN" || user.role === "EDITOR"));
  const canInspectSystem = Boolean(user && user.role !== "EDITOR");
  const section = sectionLabel(pathname);

  return (
    <main className="ops-shell">
      <div className="ops-frame">
        <aside className="compact-nav">
          <Link className="wordmark" href={user ? "/control" : "/live"} aria-label="Sports Live Ops home">
            Sports Live Ops
          </Link>

          <nav className="nav-stack" aria-label="Sports Live Ops navigation">
            <div className="nav-group">
              <span className="nav-group-label">Operations</span>
              {canOperate && <Link aria-current={isCurrent(pathname, "/control", true) ? "page" : undefined} className={navClass(pathname, "/control", true)} href="/control">Overview</Link>}
              {canOperate && <Link aria-current={isCurrent(pathname, "/control/events") ? "page" : undefined} className={navClass(pathname, "/control/events")} href="/control/events">Matches</Link>}
              <Link aria-current={isCurrent(pathname, "/control/competitions") ? "page" : undefined} className={navClass(pathname, "/control/competitions")} href="/control/competitions">Competitions</Link>
            </div>

            <div className="nav-group">
              <span className="nav-group-label">Publishing</span>
              <Link aria-current={isPublic ? "page" : undefined} className={isPublic ? "nav-link current" : "nav-link"} href="/live">Live Center</Link>
              {canEditContent && <Link aria-current={isCurrent(pathname, "/control/content") ? "page" : undefined} className={navClass(pathname, "/control/content")} href="/control/content">Content</Link>}
              {canInspectSystem && <Link aria-current={isCurrent(pathname, "/control/notifications") ? "page" : undefined} className={navClass(pathname, "/control/notifications")} href="/control/notifications">Notifications</Link>}
            </div>

            {canInspectSystem && (
              <div className="nav-group">
                <span className="nav-group-label">System</span>
                <Link aria-current={isCurrent(pathname, "/control/audit") ? "page" : undefined} className={navClass(pathname, "/control/audit")} href="/control/audit">Audit log</Link>
              </div>
            )}
          </nav>

          <div className="nav-footer">
            <span className="nav-session">{user ? user.role.toLowerCase() : "public view"}</span>
            {user ? (
              <button type="button" className="nav-signout" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button>
            ) : (
              <Link className="nav-signout" href="/login">Control Room</Link>
            )}
          </div>
        </aside>

        <section className="ops-content">
          <header className="global-header">
            <div className="header-context" aria-label="Current section">
              <span>{isPublic ? "Live Center" : "Control Room"}</span>
              <span className="header-divider" aria-hidden="true">/</span>
              <strong>{section}</strong>
            </div>
            <div className="header-utilities">
              {user ? (
                <>
                  <span className="operator">{user.name}</span>
                  <span className="role-label">{user.role.toLowerCase()}</span>
                  <button type="button" className="header-signout" onClick={() => signOut({ callbackUrl: "/login" })}>Sign out</button>
                </>
              ) : (
                <Link className="header-signout header-login" href="/login">Control Room</Link>
              )}
            </div>
          </header>
          <section className="ops-main">{children}</section>
        </section>
      </div>
    </main>
  );
}
