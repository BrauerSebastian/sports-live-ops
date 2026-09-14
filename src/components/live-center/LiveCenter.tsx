"use client";

import Link from "next/link";
import { PublicFooter } from "@/components/legal/PublicFooter";
import { useState } from "react";
import type { CommentaryItem, EventContext, EventStatus, Incident, MatchStatistics, RelatedNewsItem } from "@/types/event";

export function LiveCenter({ context, status, homeScore, awayScore, minute, incidents, commentary, statistics, relatedNews }: { context: EventContext; status: EventStatus; homeScore: number; awayScore: number; minute: number; incidents: Incident[]; commentary: CommentaryItem[]; statistics: MatchStatistics; relatedNews: RelatedNewsItem[] }) {
  const [tab, setTab] = useState<"timeline" | "commentary" | "statistics">("timeline");
  const showClock = status === "Live" || status === "Paused";
  return <div className="public-view">
    <header className="public-header">
      <Link className="public-wordmark" href="/live">SPORTS LIVE OPS <span>/ LIVE CENTER</span></Link>
      <span className="public-competition">{context.competitionName}{context.roundName ? ` / ${context.roundName}` : ""}</span>
      <Link className="follow-button" href={`/live/competitions/${context.competitionId}`}>Competition</Link>
    </header>
    <main className="public-main">
      <div className="public-intro"><div><p className="overline">{context.competitionName} / {context.seasonName ?? "Match"}</p><h1>{context.title}</h1><p className="event-location">{context.venueName}{context.venueCity ? `, ${context.venueCity}` : ""}</p></div><span className={`public-live-status status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status === "Live" && <span className="state-light" />}{status === "Live" ? "Live now" : status}</span></div>
      <section className="public-score"><div className="public-team"><span className="public-badge">{context.home.code.slice(0, 1)}</span><strong>{context.home.name}</strong></div><div><strong>{homeScore} - {awayScore}</strong><time>{showClock ? `${minute}:00` : status}</time></div><div className="public-team"><span className="public-badge east-badge">{context.away.code.slice(0, 1)}</span><strong>{context.away.name}</strong></div></section>
      <div className="public-tabs" role="tablist" aria-label="Live event views"><button role="tab" aria-selected={tab === "timeline"} className={tab === "timeline" ? "active" : ""} onClick={() => setTab("timeline")}>Timeline</button><button role="tab" aria-selected={tab === "commentary"} className={tab === "commentary" ? "active" : ""} onClick={() => setTab("commentary")}>Commentary</button><button role="tab" aria-selected={tab === "statistics"} className={tab === "statistics" ? "active" : ""} onClick={() => setTab("statistics")}>Statistics</button></div>
      <div className={`public-content${relatedNews.length ? "" : " single-column"}`}><div>{tab === "timeline" && <Timeline incidents={incidents} />}{tab === "commentary" && <Commentary commentary={commentary} />}{tab === "statistics" && <Statistics statistics={statistics} home={context.home.shortName} away={context.away.shortName} />}</div>{relatedNews.length > 0 && <aside><div className="public-section-title"><h2>Related news</h2><span>{relatedNews.length}</span></div>{relatedNews.map((article) => <Link className="public-note related-news" href={`/live/news/${article.id}`} key={article.id}><time>{article.publishedAt?.slice(0, 10)}</time><p><strong>{article.title}</strong><br />{article.summary}</p></Link>)}</aside>}</div>
    </main>
    <PublicFooter />
  </div>;
}

function Timeline({ incidents }: { incidents: Incident[] }) {
  const ordered = incidents.slice().sort((a, b) => b.minute - a.minute);
  return <section><div className="public-section-title"><h2>Match timeline</h2><span>Updated live</span></div><div className="public-feed">{ordered.length ? ordered.map((incident, index) => <div className={`public-event${incident.corrected ? " incident-corrected" : ""}`} key={incident.id ?? `${incident.minute}-${index}`}><time>{incident.minute}&apos;</time><span className={`public-event-marker ${incident.type}`} /><div><strong>{incident.label}{incident.corrected ? " (corrected)" : ""}</strong><p>{incident.team ?? "Match official"}{incident.detail ? ` / ${incident.detail}` : ""}</p></div></div>) : <p className="public-empty">No match incidents have been recorded yet.</p>}</div></section>;
}

function Commentary({ commentary }: { commentary: CommentaryItem[] }) {
  return <section className="public-commentary"><div className="public-section-title"><h2>Commentary</h2><span>From the operations desk</span></div>{commentary.length ? commentary.map((item, index) => <div className="public-note" key={item.id ?? `${item.publishedAt ?? item.minute}-${index}`}><time>{item.minute}&apos;</time><p>{item.body}</p></div>) : <p className="public-empty">No commentary has been published yet.</p>}</section>;
}

function Statistics({ statistics, home, away }: { statistics: MatchStatistics; home: string; away: string }) {
  const rows = [{ label: "Possession", value: statistics.possession }, { label: "Shots", value: statistics.shots }, { label: "Shots on target", value: statistics.shotsOnTarget }, { label: "Corners", value: statistics.corners }, { label: "Fouls", value: statistics.fouls }];
  return <section><div className="public-section-title"><h2>Statistics</h2><span>{home} / {away}</span></div><div className="public-stat-table">{rows.map((row) => <div className="public-stat-row" key={row.label}><strong>{row.label}</strong><span>{row.value.home}{row.label === "Possession" ? "%" : ""}</span><div className="public-stat-bar"><i style={{ width: `${row.value.home / (row.value.home + row.value.away || 1) * 100}%` }} /></div><span>{row.value.away}{row.label === "Possession" ? "%" : ""}</span></div>)}</div></section>;
}
