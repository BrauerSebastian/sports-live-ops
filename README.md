# Sports Live Ops

Sports Live Ops is an original sports-tech portfolio product for operating fictional live competitions and publishing the same event state to a public fan experience.

It has two connected surfaces:

- **Control Room** - authenticated event operations, event lifecycle, incidents/corrections, match clock, statistics, live commentary, editorial content, notifications, and audit history.
- **Live Center** - public competition, fixture/result, standings, news, and live-event views updated through Server-Sent Events.

The event is the center of the workflow. The Control Room uses a dense operations-workstation UI; the Live Center is a separate responsive public surface rather than an admin dashboard with the navigation removed.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript strict mode
- PostgreSQL + Prisma 6
- Zod validation
- NextAuth/Auth.js credentials sessions with bcrypt password hashes
- Server-Sent Events for realtime invalidation
- Vitest domain tests
- GitHub Actions quality checks

## Quick start

Prerequisites: Node.js 20+, npm, and PostgreSQL 14+.

### Option A - use Docker for PostgreSQL

```bash
# PowerShell or a terminal with Docker Compose
docker compose up -d postgres
```

### Option B - use your own PostgreSQL

Create a database and set `DATABASE_URL` accordingly.

Then:

```bash
npm install
```

Create `.env` from `.env.example` and set a local `NEXTAUTH_SECRET`.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Prepare the database and run the application:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open:

- Public Live Center: `http://localhost:3000/live`
- Control Room login: `http://localhost:3000/login`
- Health check: `http://localhost:3000/api/health`

## Demo accounts

The seed creates fictional local accounts with the shared demo password `ChangeMe-Portfolio-2026`:

- `operator@sports-live-ops.test` - event operations
- `editor@sports-live-ops.test` - editorial workflow
- `admin@sports-live-ops.test` - broad access

These accounts are intentionally for local portfolio demonstration only.

## Core demo

The most representative workflow is:

1. Log in as the operator.
2. Open a scheduled event in Control Room.
3. Move it through `Scheduled -> Pre-live -> Live`.
4. Open the public event in a separate browser window.
5. Apply a match minute, record a goal, publish commentary, and update statistics.
6. Observe the public Live Center update without a manual page reload.
7. Correct an incident if needed.
8. Finish the event and verify the final score and recalculated standings.
9. Inspect the Audit Log and Notification Outbox.

## Useful commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run db:generate
npm run db:validate
npm run db:migrate
npm run db:seed
```

## Main routes

Authenticated Control Room:

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

Public:

- `/live`
- `/live/competitions/[competitionId]`
- `/live/competitions/[competitionId]/fixtures`
- `/live/events/[eventId]`
- `/live/news/[articleId]`

## Documentation

- [Implementation progress](docs/PROGRESS.md)
- [Architecture](docs/architecture.md)
- [Domain model](docs/domain-model.md)
- [API surface](docs/api.md)
- [Realtime design](docs/realtime.md)
- [Testing and acceptance flow](docs/testing.md)
- [Security notes](docs/security.md)
- [Product rationale](docs/product-rationale.md)
- [Portfolio case study](docs/portfolio-case-study.md)
- [Acceptance checklist](docs/acceptance-checklist.md)
- [Architecture decisions](docs/decisions/)
- [UI redesign rationale](docs/ui-redesign.md)

## Honest scope

This is a portfolio MVP, not a claim of production deployment. The implemented vertical slice is football event operation and public live coverage. Production work would still require shared realtime infrastructure for multiple application instances, stronger identity/account lifecycle, real notification providers, deployment hardening, and database-backed browser E2E automation.
