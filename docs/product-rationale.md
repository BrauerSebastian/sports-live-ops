# Product rationale

Sports Live Ops is intentionally narrower than a general sports-management suite. The portfolio goal is to demonstrate one difficult product boundary well: authoritative live-event operations flowing into a public experience.

## Why the event workstation is central

A live operator needs speed, state clarity, and error resistance more than decorative analytics. Event Control therefore concentrates lifecycle, clock, score-producing incidents, corrections, commentary, and statistics around one event workspace. The overview exists to answer what is live, what is next, and what needs attention; it is not a KPI dashboard.

## Why Control Room and Live Center are separate surfaces

They share data but serve different users. The Control Room is dense and operational. The Live Center is public, legible, and responsive. Keeping the information architecture distinct demonstrates that a shared backend does not imply a shared interface.

## Why football first

Football supplies a compact but meaningful vertical slice: lifecycle, score, cards, substitutions, commentary, statistics, results, and standings. The schema uses sport-neutral competition/event/participant concepts where practical, but the MVP does not pretend that other sports are already implemented.

## Why audit and notification outbox exist

They show two operational concerns beyond CRUD. Audit history makes consequential changes inspectable. The notification outbox demonstrates how domain events can be queued for external delivery without pretending that an email/SMS/push provider is connected.
