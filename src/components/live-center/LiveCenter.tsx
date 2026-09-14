"use client";

import Link from "next/link";
import { useState } from "react";
import type { CommentaryItem, EventContext, EventStatus, Incident, MatchStatistics, RelatedNewsItem } from "@/types/event";

export function LiveCenter({ context, status, homeScore, awayScore, minute, incidents, commentary, statistics, relatedNews }: { context: EventContext; status: EventStatus; homeScore: number; awayScore: number; minute: number; incidents: Incident[]; commentary: CommentaryItem[]; statistics: MatchStatistics; relatedNews: RelatedNewsItem[] }) {
  const [tab, setTab] = useState<"timeline" | "commentary" | "statistics">("timeline");
  const showClock = status === "Live" || status === "Paused";
  const live = status === "Live";

  return (
    <main className="public-main public-event-page">
      <div className="public-intro">
        <div>
          <p className="overline">{context.competitionName}{context.seasonName ? ` / ${context.seasonName}` : ""}</p>
          <h1>{context.title}</h1>
          <p className="event-location">{context.venueName}{context.venueCity ? `, ${context.venueCity}` : ""}</p>
        </div>
        <div className="public-intro-actions">
          <span className={`public-event-status status-${status.toLowerCase().replaceAll(" ", "-")}`}>{live && <span className="live-dot" aria-hidden="true" />}{status}</span>
          <Link className="secondary-button" href={`/live/competitions/${context.competitionId}`}>Competition overview</Link>
        </div>
      </div>

      <section className="public-score" aria-label={`${context.home.name} ${homeScore}, ${context.away.name} ${awayScore}`}>
        <div className="public-team"><small>Home</small><strong>{context.home.name}</strong></div>
        <div className="public-score-center"><strong>{homeScore} : {awayScore}</strong><time>{showClock ? `${String(minute).padStart(2, "0")}:00` : status}</time></div>
        <div className="public-team"><small>Away</small><strong>{context.away.name}</strong></div>
      </section>

      <div className="public-tabs" role="tablist" aria-label="Match information">
        <button id="tab-timeline" type="button" role="tab" aria-controls="panel-timeline" aria-selected={tab === "timeline"} className={tab === "timeline" ? "active" : ""} onClick={() => setTab("timeline")}>Timeline</button>
        <button id="tab-commentary" type="button" role="tab" aria-controls="panel-commentary" aria-selected={tab === "commentary"} className={tab === "commentary" ? "active" : ""} onClick={() => setTab("commentary")}>Commentary</button>
        <button id="tab-statistics" type="button" role="tab" aria-controls="panel-statistics" aria-selected={tab === "statistics"} className={tab === "statistics" ? "active" : ""} onClick={() => setTab("statistics")}>Statistics</button>
      </div>

      <div className={`public-content${relatedNews.length ? "" : " single-column"}`}>
        <div>
          {tab === "timeline" && <Timeline incidents={incidents} />}
          {tab === "commentary" && <Commentary commentary={commentary} />}
          {tab === "statistics" && <Statistics statistics={statistics} home={context.home.shortName} away={context.away.shortName} />}
        </div>
        {relatedNews.length > 0 && <aside className="related-news-panel"><div className="public-section-title"><h2>Related news</h2><span>{relatedNews.length}</span></div>{relatedNews.map((article) => <Link className="public-note related-news" href={`/live/news/${article.id}`} key={article.id}><time>{article.publishedAt?.slice(0, 10)}</time><p><strong>{article.title}</strong><br />{article.summary}</p></Link>)}</aside>}
      </div>
    </main>
  );
}

function Timeline({ incidents }: { incidents: Incident[] }) {
  const ordered = incidents.slice().sort((a, b) => b.minute - a.minute);
  return <section id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline"><div className="public-section-title"><h2>Match timeline</h2><span>Newest first</span></div><div className="public-feed">{ordered.length ? ordered.map((incident, index) => <div className={`public-event${incident.corrected ? " incident-corrected" : ""}`} key={incident.id ?? `${incident.minute}-${index}`}><time>{incident.minute}&apos;</time><span className={`public-event-marker ${incident.type}`} aria-hidden="true" /><div><strong>{incident.label}{incident.corrected ? " (corrected)" : ""}</strong><p>{incident.team ?? "Match official"}{incident.detail ? `. ${incident.detail}` : ""}</p></div></div>) : <p className="public-empty">No match incidents have been recorded yet.</p>}</div></section>;
}

function Commentary({ commentary }: { commentary: CommentaryItem[] }) {
  return <section id="panel-commentary" role="tabpanel" aria-labelledby="tab-commentary" className="public-commentary"><div className="public-section-title"><h2>Commentary</h2><span>{commentary.length} updates</span></div>{commentary.length ? commentary.map((item, index) => <div className="public-note" key={item.id ?? `${item.publishedAt ?? item.minute}-${index}`}><time>{item.minute}&apos;</time><p>{item.body}</p></div>) : <p className="public-empty">No commentary has been published yet.</p>}</section>;
}

function Statistics({ statistics, home, away }: { statistics: MatchStatistics; home: string; away: string }) {
  const rows = [{ label: "Possession", value: statistics.possession }, { label: "Shots", value: statistics.shots }, { label: "Shots on target", value: statistics.shotsOnTarget }, { label: "Corners", value: statistics.corners }, { label: "Fouls", value: statistics.fouls }];
  return <section id="panel-statistics" role="tabpanel" aria-labelledby="tab-statistics"><div className="public-section-title"><h2>Statistics</h2><span>{home} / {away}</span></div><div className="public-stat-table">{rows.map((row) => <div className="public-stat-row" key={row.label}><strong>{row.label}</strong><span>{row.value.home}{row.label === "Possession" ? "%" : ""}</span><div className="public-stat-bar" aria-hidden="true"><i style={{ width: `${row.value.home / (row.value.home + row.value.away || 1) * 100}%` }} /></div><span>{row.value.away}{row.label === "Possession" ? "%" : ""}</span></div>)}</div></section>;
}
