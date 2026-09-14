# API surface

Mutation routes require an authenticated session and server-side role authorization.

- `GET /api/health` - application/database health.
- `POST /api/events/:eventId/status` - validated lifecycle transition.
- `PATCH /api/events/:eventId/clock` - persisted operator-applied match minute.
- `POST /api/events/:eventId/incidents` - validated incident or correction.
- `POST /api/events/:eventId/commentary` - publish live commentary.
- `PATCH /api/events/:eventId/statistics` - validate and persist match statistics.
- `GET /api/events/:eventId/stream` - public SSE stream.
- `POST /api/content` - create draft/published article for editor/admin.
- `PATCH /api/content/:articleId` - update, publish, or unpublish article.
- `POST /api/notifications/process` - simulate processing pending outbox entries for operator/admin.

Mutation responses return persisted records on success and non-sensitive error messages on failure. Event realtime messages are emitted only after the database transaction succeeds.
