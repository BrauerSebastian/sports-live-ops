# Realtime updates

The MVP uses Server-Sent Events (SSE) for public event pages.

## Connection

A public event page opens `GET /api/events/:eventId/stream`. The server sends a `connected` event, then keeps the connection alive with heartbeat events. The client uses the browser `EventSource` API, which automatically reconnects after a network interruption.

## Payloads

Operator mutations publish typed messages after their database transaction succeeds:

- `event.status`
- `event.incident`
- `event.commentary`
- `event.statistics`

Each message contains an event id, a unique message id, the event type, a small payload, and an emission timestamp. The public client treats the message as an invalidation signal and refreshes its server-rendered event data. PostgreSQL remains the source of truth.

## Ordering and duplicates

The current in-process bus emits in transaction-completion order. A reconnect can miss messages, so the client refreshes the complete event record rather than applying deltas. This makes duplicate delivery harmless and keeps score derivation centralized. A future durable broker should preserve the message id and add a replay cursor or event version.

## Failure and scaling

If PostgreSQL is unavailable, mutation routes return an error and no realtime message is published. If the SSE connection drops, `EventSource` reconnects and the next server render rehydrates current state.

The current bus is process-local and is suitable for one local Node process only. Production deployment across multiple instances should replace it with Redis pub/sub, NATS, or a managed event broker, while keeping the route payload contract and database-first publication order.
