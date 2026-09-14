import { describe, expect, it } from "vitest";
import { EventStatus, IncidentType } from "@prisma/client";
import { assertTransition, canTransition } from "@/lib/domain/event-state";
import { deriveScore } from "@/lib/domain/score";
import { calculateStandings } from "@/lib/domain/standings";

describe("event lifecycle", () => {
  it("allows the operational live path", () => {
    expect(canTransition(EventStatus.SCHEDULED, EventStatus.PRE_LIVE)).toBe(true);
    expect(canTransition(EventStatus.PRE_LIVE, EventStatus.LIVE)).toBe(true);
    expect(canTransition(EventStatus.LIVE, EventStatus.PAUSED)).toBe(true);
    expect(canTransition(EventStatus.PAUSED, EventStatus.LIVE)).toBe(true);
    expect(canTransition(EventStatus.LIVE, EventStatus.FINISHED)).toBe(true);
  });

  it("rejects arbitrary status changes", () => {
    expect(canTransition(EventStatus.FINISHED, EventStatus.LIVE)).toBe(false);
    expect(() => assertTransition(EventStatus.SCHEDULED, EventStatus.FINISHED)).toThrow("Invalid event transition");
  });
});

describe("score derivation", () => {
  it("derives a score from active goal incidents", () => {
    const score = deriveScore([
      { id: "g1", type: IncidentType.GOAL, participantId: "home" },
      { id: "g2", type: IncidentType.GOAL, participantId: "home" },
      { id: "g3", type: IncidentType.GOAL, participantId: "away" },
    ], "home", "away");
    expect(score).toEqual({ home: 2, away: 1 });
  });

  it("removes a corrected goal from the derived score", () => {
    const score = deriveScore([
      { id: "g1", type: IncidentType.GOAL, participantId: "home" },
      { id: "c1", type: IncidentType.CORRECTION, participantId: null, correctsIncidentId: "g1" },
    ], "home", "away");
    expect(score).toEqual({ home: 0, away: 0 });
  });
});

describe("football standings", () => {
  it("applies three points for a win and sorts by points, goal difference, then goals for", () => {
    const table = calculateStandings(["home", "away", "third"], [
      { homeParticipantId: "home", awayParticipantId: "away", homeGoals: 2, awayGoals: 0 },
      { homeParticipantId: "third", awayParticipantId: "away", homeGoals: 1, awayGoals: 1 },
    ]);
    expect(table[0]).toMatchObject({ participantId: "home", points: 3, goalDifference: 2 });
    expect(table[1]).toMatchObject({ participantId: "third", points: 1 });
    expect(table[2]).toMatchObject({ participantId: "away", points: 1, goalDifference: -2 });
  });
});
