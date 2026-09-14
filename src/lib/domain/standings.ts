export type FinishedMatch = { homeParticipantId: string; awayParticipantId: string; homeGoals: number; awayGoals: number };
export type StandingRow = { participantId: string; played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; goalDifference: number; points: number };

export function calculateStandings(participantIds: string[], matches: FinishedMatch[]) {
  const table = new Map<string, StandingRow>(participantIds.map((participantId) => [participantId, { participantId, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }]));
  for (const match of matches) {
    const home = table.get(match.homeParticipantId);
    const away = table.get(match.awayParticipantId);
    if (!home || !away) continue;
    home.played += 1; away.played += 1;
    home.goalsFor += match.homeGoals; home.goalsAgainst += match.awayGoals;
    away.goalsFor += match.awayGoals; away.goalsAgainst += match.homeGoals;
    if (match.homeGoals > match.awayGoals) { home.wins += 1; home.points += 3; away.losses += 1; }
    else if (match.homeGoals < match.awayGoals) { away.wins += 1; away.points += 3; home.losses += 1; }
    else { home.draws += 1; away.draws += 1; home.points += 1; away.points += 1; }
  }
  return [...table.values()].map((row) => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst })).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.participantId.localeCompare(b.participantId));
}
