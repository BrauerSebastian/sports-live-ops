"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  BroadcastIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileTextIcon,
  HomeIcon,
  SearchIcon,
  SoccerBallIcon,
  TrophyIcon,
} from "@/components/ui/icons";

type Role = "ADMIN" | "OPERATOR" | "EDITOR";
export type ShellUser = { name: string; role: Role };

type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
  icon: ReactNode;
  visible: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function isCurrent(pathname: string, href: string, exact = false) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  const values = name
    .split(" ")
    .map((token) => token.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  return values.toUpperCase() || "SL";
}

function roleLabel(role: Role) {
  return role === "ADMIN" ? "Administrator" : role === "EDITOR" ? "Editor" : "Operator";
}

function shellTitle(pathname: string) {
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
  const canOperate = !user || user.role === "ADMIN" || user.role === "OPERATOR";
  const canInspectSystem = Boolean(user && user.role !== "EDITOR");
  const canEditContent = Boolean(user && (user.role === "ADMIN" || user.role === "EDITOR"));

  const navGroups: NavGroup[] = [
    {
      label: "Operations",
      items: [
        { label: "Overview", href: "/control", exact: true, icon: <HomeIcon size={18} />, visible: canOperate },
        { label: "Matches", href: "/control/events", icon: <CalendarIcon size={18} />, visible: canOperate },
        { label: "Competitions", href: "/control/competitions", icon: <TrophyIcon size={18} />, visible: true },
      ],
    },
    {
      label: "Publishing",
      items: [
        { label: "Live Center", href: "/live", exact: pathname === "/live", icon: <BroadcastIcon size={18} />, visible: true },
        { label: "Notifications", href: "/control/notifications", icon: <BellIcon size={18} />, visible: canInspectSystem },
      ],
    },
    {
      label: "System",
      items: [
        { label: "Audit log", href: "/control/audit", icon: <FileTextIcon size={18} />, visible: canInspectSystem },
      ],
    },
  ];

  const activeTitle = shellTitle(pathname);
  const displayName = user?.name ?? "Jordan Mitchell";
  const displayRole = roleLabel(user?.role ?? "OPERATOR");

  return (
    <div className="cc-shell">
      <aside className="cc-sidebar">
        <Link className="cc-brand" href={user ? "/control" : "/live"} aria-label="Sports Live Ops home">
          <span className="cc-brand-mark"><SoccerBallIcon size={24} /></span>
          <span className="cc-brand-copy">
            <strong>Sports Live Ops</strong>
            <small>Control Center</small>
          </span>
        </Link>

        <nav className="cc-nav" aria-label="Primary">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => item.visible);
            if (!visibleItems.length) return null;
            return (
              <div className="cc-nav-group" key={group.label}>
                <span className="cc-nav-label">{group.label}</span>
                <div className="cc-nav-list">
                  {visibleItems.map((item) => {
                    const current = isCurrent(pathname, item.href, item.exact);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        className={`cc-nav-item${current ? " is-current" : ""}`}
                      >
                        <span className="cc-nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="cc-sidebar-footer">
          <div className="cc-system-card">
            <span className="cc-system-dot" aria-hidden="true" />
            <div>
              <strong>System status</strong>
              <small>All systems operational</small>
            </div>
            <ChevronRightIcon size={16} />
          </div>
        </div>
      </aside>

      <section className="cc-main">
        <header className="cc-topbar">
          <label className="cc-search" aria-label="Search">
            <SearchIcon size={18} />
            <input type="search" placeholder="Search matches, teams, competitions..." />
          </label>

          <div className="cc-topbar-right">
            <button type="button" className="cc-icon-button" aria-label="Notifications">
              <BellIcon size={19} />
              <span className="cc-notification-dot" aria-hidden="true" />
            </button>

            <div className="cc-user-block">
              <span className="cc-avatar">{initials(displayName)}</span>
              <div className="cc-user-copy">
                <strong>{displayName}</strong>
                <small>{displayRole}</small>
              </div>
              <ChevronDownIcon size={16} />
            </div>
          </div>
        </header>

        <div className="cc-content" data-section={activeTitle}>
          {children}
        </div>
      </section>
    </div>
  );
}
