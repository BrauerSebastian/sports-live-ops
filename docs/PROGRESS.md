# Implementation progress

This document is the source of truth for the Sports Live Ops MVP. The approved Control Room and Live Center visual language is frozen while functionality is added.

## Current baseline

- [x] Approved workstation UI exists for Control Room overview, Event Control, and Live Center.
- [x] Prototype event controls work only in client memory.
- [x] Fictional North American League demo data exists only as hardcoded arrays.
- [x] PostgreSQL-compatible Prisma schema, generated initial migration SQL, and seed exist.
- [x] Prisma server client, repositories, health endpoint, and event mutation API routes exist.
- [x] Credentials authentication foundation exists with hashed-password lookup and role-bearing sessions.
- [x] Persistent event lifecycle, incidents, commentary, statistics, audit, and notification writes exist behind server services.
- [x] Local cross-client realtime transport exists through SSE and an in-process event bus.
- [x] Initial domain unit test suite exists for lifecycle, score derivation, and standings.
- [ ] No CI workflow yet.

## Implementation checklist

### Phase 1 - Persistence foundation

- [x] Add PostgreSQL-compatible Prisma schema and enums.
- [x] Add environment example and database scripts.
- [x] Add believable fictional competition seed.
- [x] Add server-side database client and repositories/services.
- [ ] Replace prototype domain reads with database-backed reads.
- [x] Generate the initial migration SQL without a local PostgreSQL service.
- [x] Run lint, typecheck, domain tests, and build.

### Phase 2 - Auth and permissions

- [x] Add login and password hashing.
- [x] Add ADMIN, OPERATOR, and EDITOR roles to the data model and session.
- [ ] Protect Control Room routes server-side.
- [x] Enforce operator permissions in services and API routes.

### Phase 3 - Event domain

- [x] Implement explicit event lifecycle transitions.
- [x] Persist incidents and derive scores from goal incidents in tested domain code.
- [x] Persist statistics and audit records; standings calculation is covered in unit tests.
- [ ] Add database integration coverage.

### Phase 4 - Control Room completion

- [x] Add real navigable event list and competition routes.
- [x] Add editorial content list/create/edit/publish workflow.
- [x] Add notification outbox read surface and audit UI.
- [x] Add notification processing action; richer error states remain.

### Phase 5 - Public Live Center

- [x] Add public route structure.
- [x] Add competition, fixtures/results, event, and news routes.
- [x] Read published content only.
- [ ] Verify database-backed mobile behavior at 390px.

### Phase 6 - Realtime

- [x] Add event stream transport.
- [x] Broadcast operator mutations to separate public clients.
- [x] Document reconnect, ordering, duplicates, and scaling.
- [ ] Add two-context Playwright flow.

### Phase 7 - Hardening and delivery

- [ ] Add loading, empty, not-found, forbidden, and failure states.
- [ ] Add accessibility checks.
- [ ] Add health endpoint and structured error handling.
- [x] Add CI.
- [ ] Complete portfolio case study and browser workflow hardening.

## Decisions and limitations

- PostgreSQL is the target database. The application should remain buildable without a locally running database, but persistence verification requires a PostgreSQL connection.
- Football is the first sport. Core records use sport-neutral names where practical; football incident types and standings rules are explicit.
- The approved visual system in `src/app/globals.css` is preserved. New screens must use its graphite, neutral-surface, restrained-border, and lime live-state language.
- The local environment currently has no PostgreSQL listener or Docker engine, so migration application and seed execution remain pending an available database.
