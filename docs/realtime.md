# Realtime updates

The MVP uses Server-Sent Events (SSE) for public event pages.

## Connection

A public event page opens `GET /api/events/:eventId/stream`. The server sends a `connected` event and heartbeat messages. Browser `EventSource` reconnects automatically after an interruption, and the UI exposes connecting/connected/reconnecting state.

## Emitted event types

Successful operator mutations publish:

- `event.status`
- `event.clock`
- `event.incident`
- `event.commentary`
- `event.statistics`

Each message contains an event id, unique message id, event type, small payload, and emission timestamp.

## Database-first strategy

The public client treats SSE messages as invalidation signals and calls a Next.js refresh. It does not apply score or timeline deltas as its source of truth. The refreshed server read comes from PostgreSQL, so duplicate messages are harmless and a reconnect converges to persisted state.

## Ordering and missed messages

The current in-process bus emits in transaction-completion order. A disconnected browser can miss individual messages, but it does not need a perfect replay to regain correctness because the next refresh reads complete current state. A production broker could add durable replay/event-version semantics if requirements demand it.

## Scaling limitation

The current `EventEmitter` bus works only inside one Node process. A multi-instance deployment must replace it with shared pub/sub such as Redis, NATS, or a managed broker while retaining the database-first transaction/publication contract.
