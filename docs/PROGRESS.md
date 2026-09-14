# Implementation progress

This is the source of truth for the Sports Live Ops MVP. The approved Control Room and Live Center visual direction is frozen; current work is focused on functional completeness and verification.

## Implemented

### Persistence and domain

- [x] PostgreSQL/Prisma relational schema, initial migration, `.env.example`, and believable fictional seed.
- [x] Dynamic seed dates so the demo remains current instead of being tied to a past matchday.
- [x] Competition, season, participant, venue, event, incident, commentary, statistics, standings, content, audit, and notification-outbox records.
- [x] Explicit event lifecycle rules shared by server logic, operator controls, and unit tests.
- [x] Score derived from active goal incidents; corrections reference and invalidate the target incident.
- [x] Standings rebuilt from finished events.
- [x] Persisted operator-applied match minute and validated statistics.

### Authentication and authorization

- [x] Credentials authentication with bcrypt-hashed demo passwords and JWT sessions.
- [x] ADMIN, OPERATOR, and EDITOR roles.
- [x] Server-side role checks on event operations, content, notification processing, and protected Control Room route groups.
- [x] Role-aware navigation and an explicit sign-out action.
- [x] Editor sessions are directed to editorial workflows instead of event-operation controls.

### Control Room

- [x] Database-backed operations overview.
- [x] Event list with working status and competition filters.
- [x] Competition details and real standings.
- [x] Event Control workstation using real event/team/venue data rather than hardcoded match assumptions.
- [x] Server-confirmed lifecycle mutations, clock updates, incidents, goal scoring, corrections, commentary, and statistics.
- [x] Safe mutation feedback: rejected operations do not remain visible as successful local state.
- [x] Editorial create/edit/draft/publish workflow with optional competition/event associations.
- [x] Notification outbox with local processing simulator.
- [x] Filterable audit log.

### Public Live Center

- [x] Database-backed Live Center home, competition, fixtures/results, event, and published-news routes.
- [x] Real result scores and live scores derived from incidents.
- [x] Working timeline/commentary/statistics tabs.
- [x] Actual commentary minutes rather than fabricated display timestamps.
- [x] Competition standings, upcoming fixtures, and related published content.
- [x] Draft articles excluded from public reads.

### Realtime

- [x] SSE transport with automatic browser reconnect behavior.
- [x] Database remains the source of truth; realtime messages invalidate and refresh server-rendered event state.
- [x] Status, clock, incidents, commentary, and statistics broadcast after successful persistence.
- [x] Connection/reconnection status exposed to the public viewer.

### Reliability and delivery

- [x] Loading, not-found, forbidden, route-level failure, empty, and mutation-error states.
- [x] Health endpoint.
- [x] CI workflow for install, Prisma client generation, lint, typecheck, unit tests, and build.
- [x] Domain tests for lifecycle, score/corrections, standings, validation, authorization, and article rules.
- [x] Optional Docker Compose PostgreSQL service for local setup.
- [x] Architecture, API, realtime, security, testing, and portfolio documentation.

## Verification status in this handoff environment

- [x] TypeScript `tsc --noEmit` passes.
- [x] ESLint passes.
- [ ] Vitest execution could not be completed in this Linux sandbox because the uploaded `node_modules` tree was installed on Windows and contains Windows-only Rollup native packages.
- [ ] `next build` could not be completed for the same cross-platform `node_modules` reason; the sandbox has no network access to install the Linux optional binaries.
- [ ] Migration/seed and the two-browser realtime acceptance flow require a running PostgreSQL service, which is not available in this sandbox.

These are environment verification gaps, not intentionally unfinished product screens. Run the acceptance sequence in `docs/testing.md` after a clean `npm install` on the target machine.

## Known production limitations

- The in-process SSE event bus is single-instance; a multi-instance deployment needs shared pub/sub such as Redis, NATS, or a managed broker.
- Credentials auth and shared demo accounts are portfolio/demo identity, not production account lifecycle management.
- Notification delivery is simulated through the outbox; no email/SMS/push provider is connected.
- The match clock stores an operator-applied minute and is not broadcast-grade synchronized timekeeping.
- Football is the implemented sport vertical slice; the model is extensible, but other sport-specific workflows are not implemented.
- Full PostgreSQL integration and browser E2E automation should be added before treating this as production software.
