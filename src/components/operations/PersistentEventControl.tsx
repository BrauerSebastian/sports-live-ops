"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { EventControl } from "@/components/operations/EventControl";
import type { EventStatus, Incident, IncidentType, Team } from "@/app/page";

type Props = { eventId: string; initialStatus: EventStatus; initialMinute: number; initialHomeScore: number; initialAwayScore: number; initialIncidents: Incident[]; initialCommentary: string[]; homeParticipantId: string; awayParticipantId: string };

const apiType: Record<IncidentType, string> = { goal: "GOAL", card: "YELLOW_CARD", substitution: "SUBSTITUTION", period: "PERIOD_ENDED", correction: "CORRECTION" };

export function PersistentEventControl({ eventId, initialStatus, initialMinute, initialHomeScore, initialAwayScore, initialIncidents, initialCommentary, homeParticipantId, awayParticipantId }: Props) {
  const [status, setStatusState] = useState(initialStatus);
  const [minute, setMinute] = useState(initialMinute);
  const [homeScore, setHomeScore] = useState(initialHomeScore);
  const [awayScore, setAwayScore] = useState(initialAwayScore);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [commentary, setCommentary] = useState(initialCommentary);
  const [draft, setDraft] = useState("");

  const setStatus: Dispatch<SetStateAction<EventStatus>> = (value) => {
    const next = typeof value === "function" ? value(status) : value;
    setStatusState(next);
    void fetch(`/api/events/${eventId}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next.toUpperCase().replace("-", "_") }) }).then(async (response) => { if (!response.ok) setStatusState(status); });
  };

  function addIncident(type: IncidentType, label: string, team?: Team, detail?: string) {
    const participantId = team === "Northbridge FC" ? homeParticipantId : team === "Eastvale United" ? awayParticipantId : undefined;
    const nextIncident: Incident = { minute, type, label, team, detail: detail ?? "Recorded by operator" };
    setIncidents((current) => [nextIncident, ...current]);
    void fetch(`/api/events/${eventId}/incidents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: apiType[type], minute, participantId: participantId ?? null, detail: detail ?? null }) });
  }

  function addGoal(team: Team) {
    addIncident("goal", "Goal", team, "Recorded by operator");
    if (team === "Northbridge FC") setHomeScore((score) => score + 1); else setAwayScore((score) => score + 1);
  }

  function publishCommentary() {
    const body = draft.trim(); if (!body) return;
    setCommentary((current) => [body, ...current]); setDraft("");
    void fetch(`/api/events/${eventId}/commentary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, minute }) });
  }

  return <EventControl status={status} setStatus={setStatus} homeScore={homeScore} awayScore={awayScore} minute={minute} setMinute={setMinute} incidents={incidents} addGoal={addGoal} addIncident={addIncident} commentary={commentary} draft={draft} setDraft={setDraft} publishCommentary={publishCommentary} />;
}
