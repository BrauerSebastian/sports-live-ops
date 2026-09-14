# Testing and acceptance

## Automated quality checks

Run after a clean platform-native `npm install`:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The domain suite covers:

- valid and invalid event lifecycle transitions;
- score derivation from goal incidents and corrections;
- football standings and tie-break ordering;
- incident/statistics input validation;
- role separation;
- article validation/publication input rules.

CI runs install, Prisma generation, lint, typecheck, unit tests, and build on Ubuntu.

## Database acceptance setup

```bash
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

If Docker is unavailable, point `DATABASE_URL` at another PostgreSQL 14+ instance.

## Manual two-client realtime acceptance flow

Use two independent browser windows/contexts.

### Context A - operator

1. Sign in with `operator@sports-live-ops.test`.
2. Open a scheduled event.
3. Transition `Scheduled -> Pre-live -> Live`.
4. Apply a match minute.
5. Record a goal.
6. Publish commentary.
7. Update statistics.
8. Correct an incident if desired.
9. Finish the match.

### Context B - public viewer

Keep `/live/events/[eventId]` open while Context A operates the event. Without manual reload, verify:

- status changes to Live;
- clock changes;
- goal/timeline and score update;
- commentary appears with the stored event minute;
- statistics update;
- final state appears.

Then verify competition standings, audit records, and notification outbox entries.

## Remaining automated test opportunity

A PostgreSQL-backed Playwright suite should automate the two-context workflow above. It is intentionally not claimed as implemented in this handoff because the supplied dependency tree was Windows-specific and this repair sandbox had neither PostgreSQL nor network access to install browser/native Linux packages.
