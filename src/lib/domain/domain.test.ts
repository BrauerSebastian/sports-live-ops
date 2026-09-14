import { describe, expect, it } from "vitest";
import { EventStatus, IncidentType, Role } from "@prisma/client";
import { allowedTransitions, assertTransition, canTransition } from "@/lib/domain/event-state";
import { deriveScore } from "@/lib/domain/score";
import { calculateStandings } from "@/lib/domain/standings";
import { canOperate, canPublishCommentary, incidentInput, statisticsInput } from "@/lib/server/event-service";
import { articleInput, canEditContent } from "@/lib/server/content-service";

describe("event lifecycle", () => {
  it("allows the operational live path", () => {
    expect(canTransition(EventStatus.SCHEDULED, EventStatus.PRE_LIVE)).toBe(true);
    expect(canTransition(EventStatus.PRE_LIVE, EventStatus.LIVE)).toBe(true);
    expect(canTransition(EventStatus.LIVE, EventStatus.PAUSED)).toBe(true);
    expect(canTransition(EventStatus.PAUSED, EventStatus.LIVE)).toBe(true);
    expect(canTransition(EventStatus.LIVE, EventStatus.FINISHED)).toBe(true);
  });

  it("rejects arbitrary and duplicate status changes", () => {
    expect(canTransition(EventStatus.FINISHED, EventStatus.LIVE)).toBe(false);
    expect(canTransition(EventStatus.LIVE, EventStatus.LIVE)).toBe(false);
    expect(() => assertTransition(EventStatus.SCHEDULED, EventStatus.FINISHED)).toThrow("Invalid event transition");
  });

  it("exposes only valid operator actions", () => {
    expect(allowedTransitions(EventStatus.LIVE)).toEqual([EventStatus.PAUSED, EventStatus.FINISHED]);
    expect(allowedTransitions(EventStatus.FINISHED)).toEqual([]);
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

describe("event validation", () => {
  it("requires a participant for goals and cards", () => {
    expect(incidentInput.safeParse({ type: IncidentType.GOAL, minute: 12 }).success).toBe(false);
    expect(incidentInput.safeParse({ type: IncidentType.YELLOW_CARD, minute: 12 }).success).toBe(false);
  });

  it("requires a target for corrections", () => {
    expect(incidentInput.safeParse({ type: IncidentType.CORRECTION, minute: 12 }).success).toBe(false);
  });

  it("accepts a valid football goal", () => {
    expect(incidentInput.safeParse({ type: IncidentType.GOAL, minute: 12, participantId: "c123456789012345678901234" }).success).toBe(true);
  });

  it("validates possession and shots on target", () => {
    const base = { homePossession: 55, awayPossession: 45, homeShots: 10, awayShots: 8, homeShotsOnTarget: 5, awayShotsOnTarget: 3, homeCorners: 4, awayCorners: 2, homeFouls: 9, awayFouls: 11 };
    expect(statisticsInput.safeParse(base).success).toBe(true);
    expect(statisticsInput.safeParse({ ...base, awayPossession: 40 }).success).toBe(false);
    expect(statisticsInput.safeParse({ ...base, homeShotsOnTarget: 11 }).success).toBe(false);
  });
});

describe("authorization", () => {
  it("separates event operations from editorial permissions", () => {
    expect(canOperate(Role.OPERATOR)).toBe(true);
    expect(canOperate(Role.EDITOR)).toBe(false);
    expect(canEditContent(Role.EDITOR)).toBe(true);
    expect(canEditContent(Role.OPERATOR)).toBe(false);
    expect(canPublishCommentary(Role.EDITOR)).toBe(false);
  });
});

describe("article validation", () => {
  it("accepts a valid draft and rejects malformed slugs", () => {
    const article = { slug: "matchday-preview", title: "Matchday preview", summary: "A fictional preview for the next competition round.", body: "This is long enough to represent a useful editorial draft body.", status: "DRAFT" as const };
    expect(articleInput.safeParse(article).success).toBe(true);
    expect(articleInput.safeParse({ ...article, slug: "Bad Slug" }).success).toBe(false);
  });
});
