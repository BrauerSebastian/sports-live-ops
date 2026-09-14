# ADR 0002 - Derive score from goal incidents

## Status

Accepted.

## Decision

The match score is derived from active `GOAL` incidents instead of being stored as an independently editable score field. A correction is an append-only incident that references the incident it invalidates.

## Consequences

- Timeline and score cannot silently diverge through two independent write paths.
- Corrections preserve operational history.
- Rebuilding standings from finished matches uses the same score derivation rule as the UI.
