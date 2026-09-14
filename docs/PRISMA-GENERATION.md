# Prisma client generation

The application imports generated Prisma enums and model types from `@prisma/client`.

The root `postinstall` script runs `prisma generate`, so both `npm install` and `npm ci` regenerate the client from `prisma/schema.prisma` before TypeScript, tests, or the Next.js build run.

The GitHub Actions workflow also retains an explicit `npm run db:generate` step. That duplication is intentional: it makes the CI dependency explicit and keeps the workflow easy to diagnose.

If generated Prisma types appear missing locally, run:

```bash
npm run db:generate
npm run typecheck
npm test
npm run build
```

Typical symptoms of a stale/un-generated client include missing exports such as `Role`, `EventStatus`, `ArticleStatus`, `IncidentType`, or missing `Prisma.*Include` types.
