# Testing

## Current checks

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

The current Vitest suite covers the event lifecycle, score derivation from goals and corrections, and football standings ordering.

## Next integration coverage

With PostgreSQL available, add integration tests around `transitionEvent`, `createIncident`, `publishCommentary`, content publication, audit creation, and notification outbox writes. The critical Playwright flow should use two browser contexts: an authenticated operator and a public event viewer connected to the SSE route.
