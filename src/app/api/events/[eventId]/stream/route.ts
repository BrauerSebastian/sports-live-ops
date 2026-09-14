import { subscribeToLiveEvent } from "@/lib/server/event-bus";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const encoder = new TextEncoder();
  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown, id?: string) => {
        controller.enqueue(encoder.encode(`${id ? `id: ${id}\n` : ""}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      send("connected", { eventId });
      unsubscribe = subscribeToLiveEvent(eventId, (message) => send(message.type, message.payload, message.id));
      heartbeat = setInterval(() => send("heartbeat", { at: new Date().toISOString() }), 15000);
      request.signal.addEventListener("abort", () => { unsubscribe(); if (heartbeat) clearInterval(heartbeat); try { controller.close(); } catch {} });
    },
    cancel() { unsubscribe(); if (heartbeat) clearInterval(heartbeat); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}
