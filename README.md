# Sports Live Ops

**Realtime sports operations platform for managing live competitions and publishing the same event state to a public fan experience.**

Sports Live Ops is a portfolio product exploring the intersection of **product design, live operations, realtime systems, and full-stack web development**.

It contains two connected experiences:

* **Control Room** — an authenticated operations workspace for running live events.
* **Live Center** — a public-facing experience for following fixtures, results, standings, statistics, commentary, and news.

> Portfolio project. Built as an end-to-end product case study rather than a production deployment.

---

## Preview

### Control Room

*Add a large screenshot here.*

Operators manage the event lifecycle from one focused workspace: match state, score, clock, incidents, commentary, statistics, publishing, notifications, and audit history.

### Live Center

*Add a large screenshot here.*

The public experience consumes the same persisted event state and updates live without requiring a manual page refresh.

---

## The product

Live sport creates two simultaneous product problems.

Operators need to record match information quickly and accurately under time pressure.

At the same time, the audience expects that information to appear immediately and consistently across the public experience.

Sports Live Ops connects both sides of that workflow.

A match can move through:

**Scheduled → Pre-live → Live → Finished**

During the live state, an operator can record incidents, update the match minute, publish commentary, modify statistics and correct previous events.

The public Live Center receives realtime invalidations and refreshes its authoritative state from the database.

---

## Product design

The first version of the Control Room looked too much like a generic SaaS dashboard.

Decorative KPI cards, a permanent sidebar and fragmented panels competed with the actual object the operator cared about: **the match**.

The interface was redesigned around that operational context.

The final direction uses:

* A compact operations shell
* A dominant match context area
* Chronological event feed
* Fast-entry incident actions
* Dedicated publishing controls
* Clear live-state signaling
* Dense information hierarchy appropriate for operational work

The Live Center intentionally uses a different information architecture.

It is not an admin dashboard with controls removed. It is designed as a separate public and mobile-oriented product surface.

---

## Core workflows

### Event operations

Operators can:

* Move events through their lifecycle
* Update the current match minute
* Record goals and match incidents
* Correct previously recorded incidents
* Update statistics
* Publish live commentary
* Finish events
* Recalculate standings

### Editorial workflow

Editors can create and publish competition and event-related content while drafts remain excluded from public reads.

### Auditability

Important actions generate audit records so operational changes remain traceable.

### Public experience

The Live Center exposes:

* Competitions
* Fixtures and results
* Match pages
* Live score
* Statistics
* Commentary
* Standings
* Published news

---

## Realtime architecture

Server-Sent Events are used as an **invalidation channel**.

Clients do not treat transient browser events as the source of truth.

Instead:

1. A mutation is validated.
2. State is persisted to PostgreSQL.
3. A realtime invalidation event is emitted.
4. Public clients refresh authoritative database state.

This keeps the realtime implementation simple while maintaining a clear consistency model.

For a multi-instance production environment, the process-local event bus would be replaced by shared pub/sub infrastructure.

---

## Domain decisions

Several product rules are enforced in the domain rather than only through the interface.

### Event state machine

Invalid lifecycle transitions are rejected server-side.

### Score derivation

The score is derived from goal incidents rather than maintained as an unrelated mutable number.

### Incident correction

Corrections reference the incident they invalidate instead of rewriting historical records.

### Standings

Finishing a match rebuilds competition standings from finished fixtures.

### Commentary

Commentary stores both its actual match minute and publication state.

### Publishing

Draft editorial content never appears in public queries.

---

## Tech stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Responsive product UI

### Backend

* Next.js App Router
* PostgreSQL
* Prisma 6
* Zod validation

### Authentication

* Auth.js / NextAuth
* Credentials sessions
* bcrypt password hashing

### Realtime

* Server-Sent Events

### Quality

* Vitest
* ESLint
* TypeScript strict mode
* GitHub Actions

---

## Architecture

```text
┌──────────────────────────┐
│      Control Room        │
│   authenticated users    │
└─────────────┬────────────┘
              │
              │ mutations
              ▼
┌──────────────────────────┐
│   Application services   │
│ validation + domain rules│
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│       PostgreSQL         │
│         Prisma           │
└─────────────┬────────────┘
              │
              │ invalidation
              ▼
┌──────────────────────────┐
│       SSE channel        │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│       Live Center        │
│      public clients      │
└──────────────────────────┘
```

---

## Representative demo flow

The most complete workflow is:

1. Log in as an operator.
2. Open a scheduled event.
3. Move it from `Scheduled` to `Pre-live` and then `Live`.
4. Open the public Live Center in another browser window.
5. Update the match minute.
6. Record a goal.
7. Publish commentary.
8. Update match statistics.
9. Observe the Live Center update.
10. Correct an incident.
11. Finish the event.
12. Verify the final score and standings.
13. Inspect the audit history.

---

## Project structure

```text
app/
  control/
  live/
  api/

docs/
  architecture.md
  domain-model.md
  api.md
  realtime.md
  testing.md
  security.md
  product-rationale.md
  portfolio-case-study.md
  ui-redesign.md
  decisions/
```

---

## Documentation

More detailed technical and product documentation is available in:

* `docs/architecture.md`
* `docs/domain-model.md`
* `docs/api.md`
* `docs/realtime.md`
* `docs/testing.md`
* `docs/security.md`
* `docs/product-rationale.md`
* `docs/portfolio-case-study.md`
* `docs/ui-redesign.md`
* `docs/decisions/`

---

## Run locally

### Requirements

* Node.js 20+
* npm
* PostgreSQL 14+

### Install

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure `DATABASE_URL` and `NEXTAUTH_SECRET`.

Then:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000/live
http://localhost:3000/login
```

---

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

---

## Scope

Sports Live Ops is a **portfolio MVP**, not a claim of production deployment.

The implemented vertical slice focuses on football event operation and public live coverage.

A production evolution would include:

* Shared realtime infrastructure
* Stronger identity lifecycle
* External notification providers
* Deployment hardening
* Database-backed browser E2E automation
* Additional sports and competition models

---

## What this project demonstrates

This project was built to demonstrate more than implementation.

It covers:

**Product design → UX architecture → domain modeling → frontend → backend → realtime behavior → persistence → authorization → testing → technical documentation.**

The goal was to treat the system as a coherent digital product rather than a collection of screens.

---

**Designed and developed by Sebastian Brauer.**
