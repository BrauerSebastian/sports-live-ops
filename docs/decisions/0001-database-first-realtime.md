# ADR 0001 - Database-first realtime invalidation

## Status

Accepted.

## Decision

PostgreSQL is the authoritative event state. Operator mutations commit their database transaction before publishing an SSE event. Public clients use the SSE message as an invalidation signal and refresh the complete server-rendered event snapshot.

## Consequences

- A rejected mutation never becomes authoritative through browser state.
- Duplicate realtime messages are harmless.
- Reconnect correctness does not depend on replaying every transient message.
- The current process-local event bus cannot scale across multiple application instances and must later be replaced by shared pub/sub.
