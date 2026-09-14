# Portfolio case study

## Problem

Live sport creates two simultaneous product needs: operators must record event state quickly and accurately, while a public audience expects the same information to appear immediately and consistently. Sports Live Ops is a fictional end-to-end implementation of that workflow.

## Users

- **Operator** - controls event state, clock, incidents, commentary, and statistics.
- **Editor** - drafts and publishes competition/event content.
- **Admin** - broad access to operational and editorial capabilities.
- **Public viewer** - follows events, fixtures/results, standings, statistics, commentary, and news.

## UX approach

The Control Room was deliberately redesigned away from a generic SaaS dashboard into a dense operations workstation. The match is the visual and functional center; live status, score, clock, event feed, quick incident entry, publishing, and statistics are grouped around the event workflow. The Live Center is a distinct public/mobile-oriented surface that shares the domain but not the admin information architecture.

## Engineering decisions

- PostgreSQL/Prisma model the relational competition domain.
- Event status is an explicit state machine; invalid transitions are rejected server-side.
- Score is derived from goal incidents. A correction references the incident it invalidates rather than editing the historical record in place.
- Finishing an event rebuilds standings from finished fixtures.
- Commentary stores its real event minute and publication record.
- Content can be associated with a competition/event, while drafts are excluded from public reads.
- Significant mutations produce audit records and/or notification-outbox entries.
- SSE is used as an invalidation channel after successful persistence; public clients refresh from PostgreSQL instead of trusting transient browser deltas.

## Tradeoffs

The MVP chooses a simple process-local SSE bus because it keeps the portfolio architecture understandable and demonstrates the realtime contract without introducing infrastructure solely for resume keywords. That choice is explicitly limited to a single application process; shared pub/sub is the production evolution path.

The match clock is an operator-applied minute rather than a broadcast-synchronized timer. Full squad/player modeling and additional sports are also outside the football vertical slice.

## Verification

TypeScript and ESLint pass in the repair handoff. Database, Vitest, build, and browser acceptance should be rerun after a clean dependency install on the target platform with PostgreSQL available; see `docs/testing.md`.
