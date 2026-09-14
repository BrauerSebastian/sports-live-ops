export type EventStatus = "Scheduled" | "Pre-live" | "Live" | "Paused" | "Finished" | "Delayed" | "Cancelled";
export type Team = { id: string; name: string; shortName: string; code: string; side: "HOME" | "AWAY" };
export type IncidentType = "goal" | "yellow-card" | "red-card" | "substitution" | "period-start" | "period-end" | "correction";
export type Incident = { id?: string; minute: number; type: IncidentType; label: string; team?: string; teamId?: string; detail?: string; corrected?: boolean };
export type CommentaryItem = { id?: string; minute: number; body: string; author?: string; publishedAt?: string };
export type RelatedNewsItem = { id: string; title: string; summary: string; publishedAt?: string };
export type MatchStatistics = { possession: { home: number; away: number }; shots: { home: number; away: number }; shotsOnTarget: { home: number; away: number }; corners: { home: number; away: number }; fouls: { home: number; away: number } };
export type EventContext = { id: string; competitionId: string; title: string; competitionName: string; seasonName?: string; roundName?: string; venueName: string; venueCity?: string; publicViewers?: number; home: Team; away: Team };

export const statusToApi: Record<EventStatus, string> = { Scheduled: "SCHEDULED", "Pre-live": "PRE_LIVE", Live: "LIVE", Paused: "PAUSED", Finished: "FINISHED", Delayed: "DELAYED", Cancelled: "CANCELLED" };
export const apiToStatus: Record<string, EventStatus> = { SCHEDULED: "Scheduled", PRE_LIVE: "Pre-live", LIVE: "Live", PAUSED: "Paused", FINISHED: "Finished", DELAYED: "Delayed", CANCELLED: "Cancelled" };
