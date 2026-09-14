import { redirect } from "next/navigation";

export type EventStatus = "Scheduled" | "Pre-live" | "Live" | "Paused" | "Finished" | "Delayed" | "Cancelled";
export type Team = string;
export type IncidentType = "goal" | "card" | "substitution" | "period" | "correction";
export type Incident = { minute: number; type: IncidentType; label: string; team?: Team; detail?: string };

export default function Home() {
  redirect("/live");
}
