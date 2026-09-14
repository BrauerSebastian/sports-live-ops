"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LiveCenter } from "@/components/live-center/LiveCenter";
import type { EventStatus, Incident } from "@/app/page";

export function RealtimePublicEvent({ eventId, status, homeScore, awayScore, minute, incidents, commentary }: { eventId: string; status: EventStatus; homeScore: number; awayScore: number; minute: number; incidents: Incident[]; commentary: string[] }) {
  const router = useRouter();
  useEffect(() => {
    const stream = new EventSource(`/api/events/${eventId}/stream`);
    const refresh = () => router.refresh();
    stream.addEventListener("event.status", refresh);
    stream.addEventListener("event.incident", refresh);
    stream.addEventListener("event.commentary", refresh);
    stream.addEventListener("event.statistics", refresh);
    return () => { stream.close(); };
  }, [eventId, router]);
  return <LiveCenter status={status} homeScore={homeScore} awayScore={awayScore} minute={minute} incidents={incidents} commentary={commentary} />;
}
