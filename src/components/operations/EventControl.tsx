import Link from "next/link";
import { useState, type Dispatch, type SetStateAction } from "react";
import { EventStatus as PrismaEventStatus } from "@prisma/client";
import { allowedTransitions } from "@/lib/domain/event-state";
import { apiToStatus, statusToApi, type CommentaryItem, type EventContext, type EventStatus, type Incident, type IncidentType, type MatchStatistics } from "@/types/event";

type Props = {
  context: EventContext;
  status: EventStatus;
  setStatus: Dispatch<SetStateAction<EventStatus>>;
  homeScore: number;
  awayScore: number;
  minute: number;
  clockDraft: number;
  setClockDraft: Dispatch<SetStateAction<number>>;
  onApplyMinute: () => void;
  incidents: Incident[];
  addGoal: (teamId: string) => void;
  addIncident: (type: IncidentType, label: string, teamId?: string, detail?: string, correctsIncidentId?: string) => void;
  commentary: CommentaryItem[];
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  publishCommentary: () => void;
  statistics: MatchStatistics;
  onSaveStatistics: (statistics: MatchStatistics) => Promise<void>;
  pendingAction?: string;
  errorMessage?: string;
  onCorrectIncident: (incident: Incident, detail: string) => Promise<boolean>;
};

export function EventControl({ context, status, setStatus, homeScore, awayScore, minute, clockDraft, setClockDraft, onApplyMinute, incidents, addGoal, addIncident, commentary, draft, setDraft, publishCommentary, statistics, onSaveStatistics, pendingAction, errorMessage, onCorrectIncident }: Props) {
  const isBusy = Boolean(pendingAction);
  const clockVisible = status === "Live" || status === "Paused";
  const available = new Set(allowedTransitions(statusToApi[status] as PrismaEventStatus).map((next) => apiToStatus[next]));
  const home = context.home;
  const away = context.away;
  const [correctionTarget, setCorrectionTarget] = useState<Incident | null>(null);
  const [correctionNote, setCorrectionNote] = useState("");
  const [statusConfirmation, setStatusConfirmation] = useState<EventStatus | null>(null);

  function requestStatus(next: EventStatus) {
    if (next === "Finished" || next === "Cancelled") {
      setStatusConfirmation(next);
      return;
    }
    setStatus(next);
  }

  async function confirmCorrection() {
    if (!correctionTarget || !correctionNote.trim()) return;
    const saved = await onCorrectIncident(correctionTarget, correctionNote.trim());
    if (saved) {
      setCorrectionTarget(null);
      setCorrectionNote("");
    }
  }

  return <div className="view-wrap event-view">
    <header className="event-context">
      <div>
        <p className="overline">Live event / {context.competitionName} / {context.roundName ?? context.seasonName ?? "Match"}</p>
        <h1>{context.title}</h1>
        <p className="event-location">{context.venueName}{context.venueCity ? `, ${context.venueCity}` : ""}{context.publicViewers ? ` / ${context.publicViewers.toLocaleString()} public viewers` : ""}</p>
      </div>
      <Link className="secondary-button" href={`/live/events/${context.id}`}>Open Live Center</Link>
    </header>

    <section className="match-banner">
      <div className="match-team home-team"><span className="team-badge">{home.code.slice(0, 1)}</span><strong>{home.name}</strong><small>{home.shortName} / Home</small></div>
      <div className="match-score"><div><strong>{homeScore}</strong><span>-</span><strong>{awayScore}</strong></div><span className={status === "Live" ? "match-state live-state" : "match-state"}>{status.toUpperCase()}</span><time>{clockVisible ? `${String(minute).padStart(2, "0")}:00` : "--:--"}</time></div>
      <div className="match-team away-team"><span className="team-badge away-badge">{away.code.slice(0, 1)}</span><strong>{away.name}</strong><small>{away.shortName} / Away</small></div>
    </section>

    <div className="event-toolbar">
      <span className="toolbar-caption">Match control</span>
      {available.has("Pre-live") && <button disabled={isBusy} className="control-button primary-control" onClick={() => requestStatus("Pre-live")}>Prepare event</button>}
      {available.has("Live") && <button disabled={isBusy} className="control-button primary-control" onClick={() => requestStatus("Live")}>{status === "Paused" ? "Resume event" : "Start event"}</button>}
      {available.has("Paused") && <button disabled={isBusy} className="control-button primary-control" onClick={() => requestStatus("Paused")}>Pause event</button>}
      {available.has("Finished") && <button disabled={isBusy} className="control-button" onClick={() => requestStatus("Finished")}>End event</button>}
      {available.has("Delayed") && <button disabled={isBusy} className="control-button" onClick={() => requestStatus("Delayed")}>Mark delayed</button>}
      {available.has("Cancelled") && <button disabled={isBusy} className="control-button danger-control" onClick={() => requestStatus("Cancelled")}>Cancel event</button>}
      <span className="toolbar-divider" />
      <label className="clock-control">Clock <input disabled={isBusy || !clockVisible} type="range" min="0" max="130" value={clockDraft} onChange={(event) => setClockDraft(Number(event.target.value))} /><strong>{clockDraft}:00</strong><button type="button" disabled={isBusy || !clockVisible} className="text-control" onClick={onApplyMinute}>Apply</button></label>
      {pendingAction && <span className="publish-state" role="status">{pendingAction}</span>}
    </div>

    {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}

    <div className="event-workspace">
      <section className="feed-panel">
        <div className="panel-title-row"><div><span className="overline">Chronological event feed</span><h2>Match timeline</h2></div><span className="feed-source"><span className="state-light" /> Operator feed</span></div>
        <div className="incident-feed">
          {incidents.slice().sort((a, b) => b.minute - a.minute).map((incident, index) => <IncidentRow incident={incident} key={incident.id ?? `${incident.minute}-${index}`} onCorrect={(target) => { setCorrectionTarget(target); setCorrectionNote(target.detail ?? `Correct ${target.label.toLowerCase()}`); }} />)}
          {(status === "Live" || status === "Paused") && <div className="feed-now"><span className="now-marker" /><span><strong>{status === "Paused" ? "Match paused" : "Live match in progress"}</strong><small>{status === "Paused" ? "Waiting for operator resume" : "Waiting for the next event"}</small></span><time>now</time></div>}
        </div>
      </section>

      <aside className="publish-column">
        <section className="publish-panel">
          <div className="panel-title-row"><div><span className="overline">Fast entry</span><h2>Record incident</h2></div><span className="shortcut">F2</span></div>
          <div className="quick-incident-grid">
            <button disabled={isBusy || !clockVisible} onClick={() => addGoal(home.id)}><strong>Goal</strong><small>{home.shortName}</small></button>
            <button disabled={isBusy || !clockVisible} onClick={() => addGoal(away.id)}><strong>Goal</strong><small>{away.shortName}</small></button>
            <button disabled={isBusy || !clockVisible} onClick={() => addIncident("yellow-card", "Yellow card", home.id, "Player booking")}><strong>Yellow card</strong><small>{home.shortName}</small></button>
            <button disabled={isBusy || !clockVisible} onClick={() => addIncident("yellow-card", "Yellow card", away.id, "Player booking")}><strong>Yellow card</strong><small>{away.shortName}</small></button>
            <button disabled={isBusy || !clockVisible} onClick={() => addIncident("red-card", "Red card", home.id, "Player sent off")}><strong>Red card</strong><small>{home.shortName}</small></button>
            <button disabled={isBusy || !clockVisible} onClick={() => addIncident("red-card", "Red card", away.id, "Player sent off")}><strong>Red card</strong><small>{away.shortName}</small></button>
            <button disabled={isBusy || !clockVisible} onClick={() => addIncident("substitution", "Substitution", undefined, "Player change")}><strong>Substitution</strong><small>Either team</small></button>
            <button disabled={isBusy || !clockVisible} onClick={() => addIncident("period-end", "Period ended", undefined, "Official time signal")}><strong>End period</strong><small>Match official</small></button>
          </div>
        </section>

        <section className="publish-panel commentary-publish">
          <div className="panel-title-row"><div><span className="overline">Publishing</span><h2>Live commentary</h2></div><span className="publish-state">{clockVisible ? "Ready to publish" : "Event not live"}</span></div>
          <div className="published-list">{commentary.slice(0, 2).map((item, index) => <div className="published-row" key={item.id ?? `${item.publishedAt ?? item.minute}-${index}`}><time>{item.minute}:00</time><p>{item.body}</p></div>)}</div>
          <div className="composer"><textarea disabled={isBusy || !clockVisible} maxLength={500} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Draft an update for Live Center" /><div><span>Draft only until published</span><button disabled={isBusy || !clockVisible || !draft.trim()} className="publish-button" onClick={publishCommentary}>Publish update</button></div></div>
        </section>

        <StatisticsEditor statistics={statistics} onSave={onSaveStatistics} pending={pendingAction === "Saving statistics..."} disabled={isBusy || !clockVisible} />
      </aside>
    </div>

    {correctionTarget && <div className="modal-backdrop" role="presentation"><section className="operation-dialog" role="dialog" aria-modal="true" aria-labelledby="correction-title"><span className="overline">Incident correction</span><h2 id="correction-title">Correct {correctionTarget.label.toLowerCase()}</h2><p>This keeps the original incident in history and appends a correction referencing it.</p><label>Correction note<textarea autoFocus maxLength={240} value={correctionNote} onChange={(event) => setCorrectionNote(event.target.value)} /></label><div className="dialog-actions"><button className="secondary-button" type="button" disabled={isBusy} onClick={() => { setCorrectionTarget(null); setCorrectionNote(""); }}>Cancel</button><button className="publish-button" type="button" disabled={isBusy || !correctionNote.trim()} onClick={() => void confirmCorrection()}>Save correction</button></div></section></div>}

    {statusConfirmation && <div className="modal-backdrop" role="presentation"><section className="operation-dialog" role="dialog" aria-modal="true" aria-labelledby="status-confirmation-title"><span className="overline">Confirm event state</span><h2 id="status-confirmation-title">{statusConfirmation === "Finished" ? "End this event?" : "Cancel this event?"}</h2><p>{statusConfirmation === "Finished" ? "The result will become final and standings will be recalculated." : "This event will be marked cancelled and live-entry controls will close."}</p><div className="dialog-actions"><button className="secondary-button" type="button" disabled={isBusy} onClick={() => setStatusConfirmation(null)}>Keep event open</button><button className={statusConfirmation === "Cancelled" ? "secondary-button danger-control" : "publish-button"} type="button" disabled={isBusy} onClick={() => { const next = statusConfirmation; setStatusConfirmation(null); setStatus(next); }}>{statusConfirmation === "Finished" ? "End event" : "Cancel event"}</button></div></section></div>}
  </div>;
}

function IncidentRow({ incident, onCorrect }: { incident: Incident; onCorrect: (incident: Incident) => void }) {
  const canCorrect = Boolean(incident.id) && incident.type !== "correction" && !incident.corrected;
  return <div className={`incident-row${incident.corrected ? " incident-corrected" : ""}`}>
    <time>{String(incident.minute).padStart(2, "0")}:00</time>
    <span className={`incident-marker ${incident.type}`} />
    <div><strong>{incident.label}{incident.corrected ? " (corrected)" : ""}</strong><span>{incident.team ?? "Match official"}</span><small>{incident.detail ?? "Event recorded in the operations feed"}</small></div>
    {canCorrect && <button className="text-control" onClick={() => onCorrect(incident)}>Correct</button>}
  </div>;
}

function StatisticsEditor({ statistics, onSave, pending, disabled }: { statistics: MatchStatistics; onSave: (statistics: MatchStatistics) => Promise<void>; pending: boolean; disabled: boolean }) {
  const [draft, setDraft] = useState<MatchStatistics>(statistics);
  const fields = [
    { label: "Possession", key: "possession" as const, max: 100 },
    { label: "Shots", key: "shots" as const, max: 100 },
    { label: "Shots on target", key: "shotsOnTarget" as const, max: 100 },
    { label: "Corners", key: "corners" as const, max: 50 },
    { label: "Fouls", key: "fouls" as const, max: 50 },
  ];
  const validPossession = draft.possession.home + draft.possession.away === 100;
  const validShots = draft.shotsOnTarget.home <= draft.shots.home && draft.shotsOnTarget.away <= draft.shots.away;
  const valid = validPossession && validShots;
  const status = !validPossession ? "Possession must total 100" : !validShots ? "Shots on target cannot exceed shots" : "Valid";
  return <section className="publish-panel statistics-editor">
    <div className="panel-title-row"><div><span className="overline">Match data</span><h2>Statistics</h2></div><span className="publish-state">{status}</span></div>
    {fields.map((field) => <div className="stat-edit-row" key={field.key}><span>{field.label}</span><input disabled={disabled} type="number" min="0" max={field.max} value={draft[field.key].home} onChange={(event) => setDraft({ ...draft, [field.key]: { ...draft[field.key], home: Number(event.target.value) } })} /><span>-</span><input disabled={disabled} type="number" min="0" max={field.max} value={draft[field.key].away} onChange={(event) => setDraft({ ...draft, [field.key]: { ...draft[field.key], away: Number(event.target.value) } })} /></div>)}
    <button className="publish-button" disabled={disabled || pending || !valid} onClick={() => onSave(draft)}>{pending ? "Saving..." : "Save statistics"}</button>
  </section>;
}
