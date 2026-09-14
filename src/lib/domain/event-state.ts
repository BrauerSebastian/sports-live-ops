import { EventStatus } from "@prisma/client";

const transitions: Record<EventStatus, readonly EventStatus[]> = {
  SCHEDULED: [EventStatus.PRE_LIVE, EventStatus.DELAYED, EventStatus.CANCELLED],
  PRE_LIVE: [EventStatus.LIVE, EventStatus.DELAYED, EventStatus.CANCELLED],
  LIVE: [EventStatus.PAUSED, EventStatus.FINISHED],
  PAUSED: [EventStatus.LIVE, EventStatus.FINISHED, EventStatus.DELAYED],
  FINISHED: [],
  DELAYED: [EventStatus.PRE_LIVE, EventStatus.CANCELLED],
  CANCELLED: [],
};

export function canTransition(from: EventStatus, to: EventStatus) { return transitions[from].includes(to); }
export function allowedTransitions(from: EventStatus) { return [...transitions[from]]; }
export function assertTransition(from: EventStatus, to: EventStatus) {
  if (!canTransition(from, to)) throw new Error(`Invalid event transition: ${from} -> ${to}`);
}
