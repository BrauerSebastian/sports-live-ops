"use client";

import { useState } from "react";
import { OperationsShell } from "@/components/shell/OperationsShell";
import { ControlRoomOverview } from "@/components/operations/ControlRoomOverview";
import { EventControl } from "@/components/operations/EventControl";
import { LiveCenter } from "@/components/live-center/LiveCenter";

export type EventStatus = "Scheduled" | "Live" | "Paused" | "Finished";
export type Team = "Northbridge FC" | "Eastvale United";
export type IncidentType = "goal" | "card" | "substitution" | "period" | "correction";
export type Incident = { minute: number; type: IncidentType; label: string; team?: Team; detail?: string };

const initialIncidents: Incident[] = [
  { minute: 12, type: "goal", label: "Goal", team: "Northbridge FC", detail: "L. Okafor, assisted by M. Reed" },
  { minute: 28, type: "card", label: "Yellow card", team: "Eastvale United", detail: "M. Costa" },
];

export default function Home() {
  const [activeView, setActiveView] = useState<"overview" | "event" | "live">("event");
  const [status, setStatus] = useState<EventStatus>("Live");
  const [homeScore, setHomeScore] = useState(1);
  const [awayScore, setAwayScore] = useState(0);
  const [minute, setMinute] = useState(64);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [commentary, setCommentary] = useState([
    "Northbridge are controlling the tempo through the middle third.",
    "A quick Eastvale counter is cleared at the near post.",
  ]);
  const [draft, setDraft] = useState("");

  function addIncident(type: IncidentType, label: string, team?: Team, detail?: string) {
    setIncidents((current) => [...current, { minute, type, label, team, detail }]);
  }

  function addGoal(team: Team) {
    addIncident("goal", "Goal", team, "Recorded by Jordan Mitchell");
    if (team === "Northbridge FC") setHomeScore((score) => score + 1);
    else setAwayScore((score) => score + 1);
  }

  function publishCommentary() {
    if (!draft.trim()) return;
    setCommentary((current) => [draft.trim(), ...current]);
    setDraft("");
  }

  return (
    <OperationsShell activeView={activeView} onNavigate={setActiveView}>
      {activeView === "overview" && <ControlRoomOverview onOpenEvent={() => setActiveView("event")} />}
      {activeView === "event" && <EventControl status={status} setStatus={setStatus} homeScore={homeScore} awayScore={awayScore} minute={minute} setMinute={setMinute} incidents={incidents} addGoal={addGoal} addIncident={addIncident} commentary={commentary} draft={draft} setDraft={setDraft} publishCommentary={publishCommentary} />}
      {activeView === "live" && <LiveCenter status={status} homeScore={homeScore} awayScore={awayScore} minute={minute} incidents={incidents} commentary={commentary} />}
    </OperationsShell>
  );
}
