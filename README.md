# Sports Live Ops

Sports Live Ops is an original sports technology product for running fictional live competitions. It has two connected surfaces:

- **Control Room**: authenticated event operations, incidents, commentary, editorial content, notifications, and audit records.
- **Live Center**: public competition, fixture, news, and live event views.

The approved visual baseline is a dense graphite and neutral operations workstation with a lime live-state accent. The event itself is the center of the workflow.

## Stack

- Next.js App Router 16
- React and TypeScript strict mode
- PostgreSQL and Prisma 6
- Zod validation
- Auth.js credentials authentication
- Vitest domain tests
- Server-Sent Events for local realtime invalidation

## Local setup

Prerequisites: Node.js 20+, npm, and PostgreSQL 14+.

```bash
npm install
Copy-Item .env.example .env
# Set DATABASE_URL and NEXTAUTH_SECRET in .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000/live](http://localhost:3000/live) for the public surface or [http://localhost:3000/login](http://localhost:3000/login) for Control Room access.

This workspace does not include Docker or a local PostgreSQL service, so migration and seed execution require a PostgreSQL instance supplied by the developer.

## Demo accounts

The seed creates fictional accounts with the shared demo password `ChangeMe-Portfolio-2026`:

- `operator@sports-live-ops.test` - event operations
- `editor@sports-live-ops.test` - editorial workflow
- `admin@sports-live-ops.test` - broad access

These credentials are for local portfolio demonstrations only. Change them before any deployed use.

## Useful commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run db:validate
npm run db:migrate
npm run db:seed
```

## Routes

Control Room routes are protected by the authenticated server layout:

- `/control`
- `/control/events`
- `/control/events/[eventId]`
- `/control/competitions`
- `/control/competitions/[competitionId]`
- `/control/content`
- `/control/content/new`
- `/control/content/[articleId]`
- `/control/notifications`
- `/control/audit`

Public routes:

- `/live`
- `/live/competitions/[competitionId]`
- `/live/competitions/[competitionId]/fixtures`
- `/live/events/[eventId]`
- `/live/news/[articleId]`

## Documentation

- [Implementation progress](docs/PROGRESS.md)
- [Architecture](docs/architecture.md)
- [Domain model](docs/domain-model.md)
- [Realtime design](docs/realtime.md)
- [UI redesign critique](docs/ui-redesign.md)

## Honest scope

Implemented now: relational schema, migration SQL, fictional seed, hashed demo accounts, Auth.js credentials foundation, role-aware event/content APIs, event lifecycle rules, score derivation, standings calculation, audit/outbox writes, route surfaces, and local SSE transport.

Still planned: database integration tests, full route-level authorization matrix, durable multi-instance realtime transport, notification processing UI, richer statistics editing, and CI/browser workflow hardening.
