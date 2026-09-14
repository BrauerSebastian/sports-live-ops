"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveCenter } from "@/components/live-center/LiveCenter";
import type { CommentaryItem, EventContext, EventStatus, Incident, MatchStatistics, RelatedNewsItem } from "@/types/event";

export function RealtimePublicEvent({ eventId, context, status, homeScore, awayScore, minute, incidents, commentary, statistics, relatedNews }: { eventId: string; context: EventContext; status: EventStatus; homeScore: number; awayScore: number; minute: number; incidents: Incident[]; commentary: CommentaryItem[]; statistics: MatchStatistics; relatedNews: RelatedNewsItem[] }) {
  const router = useRouter();
  const [connection, setConnection] = useState<"connecting" | "connected" | "reconnecting">("connecting");

  useEffect(() => {
    const stream = new EventSource(`/api/events/${eventId}/stream`);
    stream.onopen = () => setConnection("connected");
    stream.onerror = () => setConnection("reconnecting");
    const refresh = () => router.refresh();
    stream.addEventListener("event.status", refresh);
    stream.addEventListener("event.incident", refresh);
    stream.addEventListener("event.commentary", refresh);
    stream.addEventListener("event.statistics", refresh);
    stream.addEventListener("event.clock", refresh);
    return () => { stream.close(); };
  }, [eventId, router]);

  return <>
    <LiveCenter context={context} status={status} homeScore={homeScore} awayScore={awayScore} minute={minute} incidents={incidents} commentary={commentary} statistics={statistics} relatedNews={relatedNews} />
    {connection !== "connected" && <p className={`realtime-state ${connection}`} role="status">{connection === "reconnecting" ? "Reconnecting live updates" : "Connecting live updates"}</p>}
  </>;
}
