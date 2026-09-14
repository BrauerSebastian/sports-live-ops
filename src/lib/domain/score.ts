import { IncidentType } from "@prisma/client";

export type GoalIncident = { id: string; type: IncidentType; participantId: string | null; correctsIncidentId?: string | null };

export function deriveScore(incidents: GoalIncident[], homeParticipantId: string, awayParticipantId: string) {
  const correctedGoalIds = new Set(incidents.map((incident) => incident.correctsIncidentId).filter((id): id is string => Boolean(id)));
  const goals = incidents.filter((incident) => incident.type === IncidentType.GOAL && !correctedGoalIds.has(incident.id));
  return {
    home: goals.filter((incident) => incident.participantId === homeParticipantId).length,
    away: goals.filter((incident) => incident.participantId === awayParticipantId).length,
  };
}
