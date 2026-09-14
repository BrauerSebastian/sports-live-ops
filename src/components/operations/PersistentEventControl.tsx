"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { EventControl } from "@/components/operations/EventControl";
import type { CommentaryItem, EventContext, EventStatus, Incident, IncidentType, MatchStatistics } from "@/types/event";
import { statusToApi } from "@/types/event";

type Props = {
  eventId: string;
  context: EventContext;
  initialStatus: EventStatus;
  initialMinute: number;
  initialHomeScore: number;
  initialAwayScore: number;
  initialIncidents: Incident[];
  initialCommentary: CommentaryItem[];
  initialStatistics: MatchStatistics;
};

const apiType: Record<IncidentType, string> = {
  goal: "GOAL",
  "yellow-card": "YELLOW_CARD",
  "red-card": "RED_CARD",
  substitution: "SUBSTITUTION",
  "period-start": "PERIOD_STARTED",
  "period-end": "PERIOD_ENDED",
  correction: "CORRECTION",
};

export function PersistentEventControl({ eventId, context, initialStatus, initialMinute, initialHomeScore, initialAwayScore, initialIncidents, initialCommentary, initialStatistics }: Props) {
  const [status, setStatusState] = useState(initialStatus);
  const [minute, setMinute] = useState(initialMinute);
  const [clockDraft, setClockDraft] = useState(initialMinute);
  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [commentary, setCommentary] = useState(initialCommentary);
  const [statistics, setStatistics] = useState(initialStatistics);
  const [draft, setDraft] = useState("");
  const [pendingAction, setPendingAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function request(path: string, options: RequestInit) {
    setErrorMessage("");
    const response = await fetch(path, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error ?? "The operation could not be completed.");
    return payload;
  }

  const setStatus: Dispatch<SetStateAction<EventStatus>> = (value) => {
    const next = typeof value === "function" ? value(status) : value;
    void (async () => {
      setPendingAction("Saving status...");
      try {
        await request(`/api/events/${eventId}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: statusToApi[next] }) });
        setStatusState(next);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Status could not be saved.");
      } finally { setPendingAction(""); }
    })();
  };

  async function updateClock() {
    setPendingAction("Saving clock...");
    try {
      await request(`/api/events/${eventId}/clock`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ minute: clockDraft }) });
      setMinute(clockDraft);
    } catch (error) {
      setClockDraft(minute);
      setErrorMessage(error instanceof Error ? error.message : "Clock could not be saved.");
    } finally { setPendingAction(""); }
  }

  async function addIncident(type: IncidentType, label: string, teamId?: string, detail?: string, correctsIncidentId?: string) {
    setPendingAction("Saving incident...");
    try {
      const payload = await request(`/api/events/${eventId}/incidents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: apiType[type], minute, participantId: teamId ?? null, detail: detail ?? null, correctsIncidentId: correctsIncidentId ?? null }) });
      const team = teamId === context.home.id ? context.home.name : teamId === context.away.id ? context.away.name : undefined;
      setIncidents((current) => [...current, { id: payload.incident.id, minute, type, label, team, teamId, detail: detail ?? "Recorded by operator" }]);
      if (type === "goal") {
        if (teamId === context.home.id) setHomeScore((score) => score + 1);
        else if (teamId === context.away.id) setAwayScore((score) => score + 1);
      }
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Incident could not be saved.");
      return false;
    } finally { setPendingAction(""); }
  }

  const addGoal = (teamId: string) => void addIncident("goal", "Goal", teamId, "Recorded by operator");

  async function publishCommentary() {
    const body = draft.trim();
    if (!body) return;
    setPendingAction("Publishing commentary...");
    try {
      const payload = await request(`/api/events/${eventId}/commentary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, minute }) });
      setCommentary((current) => [{ id: payload.comment.id, body, minute, publishedAt: payload.comment.publishedAt }, ...current]);
      setDraft("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Commentary could not be published.");
    } finally { setPendingAction(""); }
  }

  async function saveStatistics(next: MatchStatistics) {
    setPendingAction("Saving statistics...");
    try {
      await request(`/api/events/${eventId}/statistics`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ homePossession: next.possession.home, awayPossession: next.possession.away, homeShots: next.shots.home, awayShots: next.shots.away, homeShotsOnTarget: next.shotsOnTarget.home, awayShotsOnTarget: next.shotsOnTarget.away, homeCorners: next.corners.home, awayCorners: next.corners.away, homeFouls: next.fouls.home, awayFouls: next.fouls.away }) });
      setStatistics(next);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Statistics could not be saved.");
    } finally { setPendingAction(""); }
  }

  async function correctIncident(target: Incident, detail: string) {
    if (!target.id || target.type === "correction" || target.corrected) return false;
    const saved = await addIncident("correction", "Correction", target.teamId, detail, target.id);
    if (!saved) return false;
    setIncidents((current) => current.map((incident) => incident.id === target.id ? { ...incident, corrected: true } : incident));
    if (target.type === "goal") {
      if (target.teamId === context.home.id) setHomeScore((score) => Math.max(0, score - 1));
      if (target.teamId === context.away.id) setAwayScore((score) => Math.max(0, score - 1));
    }
    return true;
  }

  return <EventControl context={context} status={status} setStatus={setStatus} homeScore={homeScore} awayScore={awayScore} minute={minute} clockDraft={clockDraft} setClockDraft={setClockDraft} onApplyMinute={updateClock} incidents={incidents} addGoal={addGoal} addIncident={addIncident} commentary={commentary} draft={draft} setDraft={setDraft} publishCommentary={publishCommentary} statistics={statistics} onSaveStatistics={saveStatistics} pendingAction={pendingAction} errorMessage={errorMessage} onCorrectIncident={correctIncident} />;
}
