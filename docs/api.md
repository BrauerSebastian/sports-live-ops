# API surface

All mutation routes require an authenticated session and server-side role authorization.

- `GET /api/health` checks application and PostgreSQL availability.
- `POST /api/events/:eventId/status` validates an event lifecycle transition.
- `POST /api/events/:eventId/incidents` records a validated football incident.
- `POST /api/events/:eventId/commentary` publishes live commentary.
- `PATCH /api/events/:eventId/statistics` validates and persists match statistics.
- `GET /api/events/:eventId/stream` opens the public SSE event stream.
- `POST /api/content` creates a draft or published article for an editor/admin.
- `PATCH /api/content/:articleId` updates or publishes an article for an editor/admin.

Mutation responses return the persisted record on success and a non-sensitive error message with validation issues on bad input. The database transaction completes before a realtime message is emitted.
