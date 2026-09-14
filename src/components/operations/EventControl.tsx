import Link from "next/link";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
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

  useEffect(() => {
    if (!correctionTarget && !statusConfirmation) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || isBusy) return;
      setCorrectionTarget(null);
      setCorrectionNote("");
      setStatusConfirmation(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [correctionTarget, statusConfirmation, isBusy]);

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

  const orderedIncidents = incidents.slice().sort((a, b) => b.minute - a.minute);

  return <div className="view-wrap event-view">
    <header className="event-context">
      <div>
        <p className="overline">{context.competitionName}{context.roundName ? ` / ${context.roundName}` : context.seasonName ? ` / ${context.seasonName}` : ""}</p>
        <h1>{context.title}</h1>
        <p className="event-location">{context.venueName}{context.venueCity ? `, ${context.venueCity}` : ""}{context.publicViewers ? `. ${context.publicViewers.toLocaleString()} viewers` : ""}</p>
      </div>
      <Link className="secondary-button" href={`/live/events/${context.id}`}>View public match</Link>
    </header>

    <section className="match-banner" aria-label={`${home.name} ${homeScore}, ${away.name} ${awayScore}`}>
      <div className="match-team home-team">
        <small>Home</small>
        <strong>{home.name}</strong>
      </div>
      <div className="match-score">
        <div><strong>{homeScore}</strong><span>:</span><strong>{awayScore}</strong></div>
        <div className="match-score-meta">
          <span className={status === "Live" ? "match-state live-state" : "match-state"}>{status}</span>
          <time>{clockVisible ? `${String(minute).padStart(2, "0")}:00` : "Not running"}</time>
        </div>
      </div>
      <div className="match-team away-team">
        <small>Away</small>
        <strong>{away.name}</strong>
      </div>
    </section>

    <div className="event-toolbar" aria-label="Match controls">
      <div className="event-actions">
        {available.has("Pre-live") && <button disabled={isBusy} className="control-button primary-control" onClick={() => requestStatus("Pre-live")}>Prepare event</button>}
        {available.has("Live") && <button disabled={isBusy} className="control-button primary-control" onClick={() => requestStatus("Live")}>{status === "Paused" ? "Resume match" : "Start match"}</button>}
        {available.has("Paused") && <button disabled={isBusy} className="control-button primary-control" onClick={() => requestStatus("Paused")}>Pause match</button>}
        {available.has("Finished") && <button disabled={isBusy} className="control-button" onClick={() => requestStatus("Finished")}>End match</button>}
        {available.has("Delayed") && <button disabled={isBusy} className="control-button" onClick={() => requestStatus("Delayed")}>Mark delayed</button>}
        {available.has("Cancelled") && <button disabled={isBusy} className="control-button danger-control" onClick={() => requestStatus("Cancelled")}>Cancel match</button>}
      </div>

      <div className="clock-control">
        <label htmlFor="match-minute">Match minute</label>
        <input id="match-minute" aria-label="Match minute" disabled={isBusy || !clockVisible} type="number" min="0" max="130" step="1" value={clockDraft} onChange={(event) => setClockDraft(Math.max(0, Math.min(130, Number(event.target.value))))} />
        <button type="button" disabled={isBusy || !clockVisible || clockDraft === minute} className="secondary-button clock-apply" onClick={onApplyMinute}>Apply</button>
      </div>
      {pendingAction && <span className="pending-state" role="status">{pendingAction}</span>}
    </div>

    {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}

    <div className="event-workspace">
      <section className="feed-panel">
        <div className="panel-title-row">
          <div><span className="overline">Match feed</span><h2>Timeline</h2></div>
          <span className="section-meta">Newest first</span>
        </div>
        <div className="incident-feed">
          {(status === "Live" || status === "Paused") && <div className="feed-now"><time>{String(minute).padStart(2, "0")}:00</time><span className="now-marker" aria-hidden="true" /><div><strong>{status === "Paused" ? "Match paused" : "Live now"}</strong><small>{status === "Paused" ? "Waiting for operator resume" : "Waiting for the next incident"}</small></div><span className="live-chip">{status}</span></div>}
          {orderedIncidents.map((incident, index) => <IncidentRow incident={incident} key={incident.id ?? `${incident.minute}-${index}`} onCorrect={(target) => { setCorrectionTarget(target); setCorrectionNote(target.detail ?? `Correct ${target.label.toLowerCase()}`); }} />)}
          {!orderedIncidents.length && status !== "Live" && status !== "Paused" && <p className="route-empty">No incidents recorded for this match.</p>}
        </div>
      </section>

      <aside className="publish-column">
        <section className="publish-panel quick-entry-panel">
          <div className="panel-title-row"><div><span className="overline">Operator input</span><h2>Record incident</h2></div></div>
          <div className="quick-incident-grid" role="group" aria-label="Team incidents">
            <div className="incident-column-head"><span>Home</span><strong>{home.shortName}</strong></div>
            <div className="incident-column-head"><span>Away</span><strong>{away.shortName}</strong></div>
            <button type="button" className="incident-action goal-action" disabled={isBusy || !clockVisible} onClick={() => addGoal(home.id)}><strong>Goal</strong><small>{home.shortName}</small></button>
            <button type="button" className="incident-action goal-action" disabled={isBusy || !clockVisible} onClick={() => addGoal(away.id)}><strong>Goal</strong><small>{away.shortName}</small></button>
            <button type="button" className="incident-action yellow-action" disabled={isBusy || !clockVisible} onClick={() => addIncident("yellow-card", "Yellow card", home.id, "Player booking")}><strong>Yellow card</strong><small>{home.shortName}</small></button>
            <button type="button" className="incident-action yellow-action" disabled={isBusy || !clockVisible} onClick={() => addIncident("yellow-card", "Yellow card", away.id, "Player booking")}><strong>Yellow card</strong><small>{away.shortName}</small></button>
            <button type="button" className="incident-action red-action" disabled={isBusy || !clockVisible} onClick={() => addIncident("red-card", "Red card", home.id, "Player sent off")}><strong>Red card</strong><small>{home.shortName}</small></button>
            <button type="button" className="incident-action red-action" disabled={isBusy || !clockVisible} onClick={() => addIncident("red-card", "Red card", away.id, "Player sent off")}><strong>Red card</strong><small>{away.shortName}</small></button>
          </div>
          <div className="incident-wide-actions">
            <button type="button" className="incident-action neutral-action" disabled={isBusy || !clockVisible} onClick={() => addIncident("substitution", "Substitution", undefined, "Player change")}><strong>Substitution</strong><small>Either team</small></button>
            <button type="button" className="incident-action neutral-action" disabled={isBusy || !clockVisible} onClick={() => addIncident("period-end", "Period ended", undefined, "Official time signal")}><strong>End period</strong><small>Match official</small></button>
          </div>
        </section>

        <section className="publish-panel commentary-publish">
          <div className="panel-title-row"><div><span className="overline">Publishing</span><h2>Live commentary</h2></div><span className={clockVisible ? "publish-state" : "validation-state"}>{clockVisible ? "Available" : "Match not live"}</span></div>
          <div className="published-list">{commentary.slice(0, 3).map((item, index) => <div className="published-row" key={item.id ?? `${item.publishedAt ?? item.minute}-${index}`}><time>{item.minute}:00</time><p>{item.body}</p></div>)}</div>
          <div className="composer">
            <label htmlFor="commentary-draft">Commentary update</label>
            <textarea id="commentary-draft" disabled={isBusy || !clockVisible} maxLength={500} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a factual match update" />
            <div><span>{draft.length}/500</span><button type="button" disabled={isBusy || !clockVisible || !draft.trim()} className="publish-button" onClick={publishCommentary}>Publish</button></div>
          </div>
        </section>

        <StatisticsEditor statistics={statistics} onSave={onSaveStatistics} pending={pendingAction === "Saving statistics..."} disabled={isBusy || !clockVisible} homeLabel={home.shortName} awayLabel={away.shortName} />
      </aside>
    </div>

    {correctionTarget && <div className="modal-backdrop" role="presentation"><section className="operation-dialog" role="dialog" aria-modal="true" aria-labelledby="correction-title"><span className="overline">Incident correction</span><h2 id="correction-title">Correct {correctionTarget.label.toLowerCase()}</h2><p>The original incident remains in the audit trail. The correction is recorded as a separate event.</p><label>Correction note<textarea autoFocus maxLength={240} value={correctionNote} onChange={(event) => setCorrectionNote(event.target.value)} /></label><div className="dialog-actions"><button className="secondary-button" type="button" disabled={isBusy} onClick={() => { setCorrectionTarget(null); setCorrectionNote(""); }}>Cancel</button><button className="publish-button" type="button" disabled={isBusy || !correctionNote.trim()} onClick={() => void confirmCorrection()}>Save correction</button></div></section></div>}

    {statusConfirmation && <div className="modal-backdrop" role="presentation"><section className="operation-dialog" role="dialog" aria-modal="true" aria-labelledby="status-confirmation-title"><span className="overline">Confirm match state</span><h2 id="status-confirmation-title">{statusConfirmation === "Finished" ? "End this match?" : "Cancel this match?"}</h2><p>{statusConfirmation === "Finished" ? "The result becomes final and standings are recalculated." : "The match is marked cancelled and live entry controls close."}</p><div className="dialog-actions"><button className="secondary-button" type="button" disabled={isBusy} onClick={() => setStatusConfirmation(null)}>Go back</button><button className={statusConfirmation === "Cancelled" ? "secondary-button danger-control" : "publish-button"} type="button" disabled={isBusy} onClick={() => { const next = statusConfirmation; setStatusConfirmation(null); setStatus(next); }}>{statusConfirmation === "Finished" ? "End match" : "Cancel match"}</button></div></section></div>}
  </div>;
}

function IncidentRow({ incident, onCorrect }: { incident: Incident; onCorrect: (incident: Incident) => void }) {
  const canCorrect = Boolean(incident.id) && incident.type !== "correction" && !incident.corrected;
  return <div className={`incident-row${incident.corrected ? " incident-corrected" : ""}`}>
    <time>{String(incident.minute).padStart(2, "0")}:00</time>
    <span className={`incident-marker ${incident.type}`} aria-hidden="true" />
    <div><strong>{incident.label}{incident.corrected ? " (corrected)" : ""}</strong><span>{incident.team ?? "Match official"}</span>{incident.detail && <small>{incident.detail}</small>}</div>
    {canCorrect && <button type="button" className="text-control" onClick={() => onCorrect(incident)}>Correct</button>}
  </div>;
}

function StatisticsEditor({ statistics, onSave, pending, disabled, homeLabel, awayLabel }: { statistics: MatchStatistics; onSave: (statistics: MatchStatistics) => Promise<void>; pending: boolean; disabled: boolean; homeLabel: string; awayLabel: string }) {
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
  const status = !validPossession ? "Possession must total 100" : !validShots ? "Shots on target exceed shots" : "Ready";

  return <section className="publish-panel statistics-editor">
    <div className="panel-title-row"><div><span className="overline">Match data</span><h2>Statistics</h2></div><span className={valid ? "publish-state" : "validation-state"}>{status}</span></div>
    <div className="statistics-grid">
      <div className="stat-head"><span>Metric</span><strong>{homeLabel}</strong><strong>{awayLabel}</strong></div>
      {fields.map((field) => <div className="stat-edit-row" key={field.key}>
        <label htmlFor={`stat-home-${field.key}`}>{field.label}</label>
        <input id={`stat-home-${field.key}`} aria-label={`${homeLabel} ${field.label}`} disabled={disabled} type="number" min="0" max={field.max} value={draft[field.key].home} onChange={(event) => setDraft({ ...draft, [field.key]: { ...draft[field.key], home: Number(event.target.value) } })} />
        <input id={`stat-away-${field.key}`} aria-label={`${awayLabel} ${field.label}`} disabled={disabled} type="number" min="0" max={field.max} value={draft[field.key].away} onChange={(event) => setDraft({ ...draft, [field.key]: { ...draft[field.key], away: Number(event.target.value) } })} />
      </div>)}
    </div>
    <div className="statistics-footer"><span>{disabled ? "Available while the match is live or paused." : "Save to publish updated values to the Live Center."}</span><button type="button" className="publish-button" disabled={disabled || pending || !valid} onClick={() => void onSave(draft)}>{pending ? "Saving..." : "Save statistics"}</button></div>
  </section>;
}
