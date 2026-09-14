import { EventEmitter } from "node:events";

export type LiveEventMessage = { id: string; eventId: string; type: string; payload: Record<string, unknown>; emittedAt: string };

const globalForBus = globalThis as unknown as { sportsLiveBus?: EventEmitter };
const bus = globalForBus.sportsLiveBus ?? new EventEmitter();
bus.setMaxListeners(0);
if (process.env.NODE_ENV !== "production") globalForBus.sportsLiveBus = bus;

export function publishLiveEvent(eventId: string, type: string, payload: Record<string, unknown>) {
  const message: LiveEventMessage = { id: crypto.randomUUID(), eventId, type, payload, emittedAt: new Date().toISOString() };
  bus.emit(`event:${eventId}`, message);
  return message;
}

export function subscribeToLiveEvent(eventId: string, listener: (message: LiveEventMessage) => void) {
  const channel = `event:${eventId}`;
  bus.on(channel, listener);
  return () => bus.off(channel, listener);
}
