# Portfolio acceptance checklist

Use this before making the repository public or linking it from the CV.

- [ ] Clean `npm install` succeeds on the target machine.
- [ ] `docker compose up -d postgres` (or equivalent PostgreSQL) is healthy.
- [ ] `npm run db:migrate` succeeds.
- [ ] `npm run db:seed` succeeds.
- [ ] Operator, editor, and admin demo accounts can sign in and sign out.
- [ ] Editor cannot access event-operation pages or APIs.
- [ ] Two different seeded fixtures display their own teams/venues/ids correctly.
- [ ] Event lifecycle follows only allowed transitions.
- [ ] Applied clock persists after reload and updates a public viewer.
- [ ] Goal changes derived score and survives reload.
- [ ] Correction invalidates the target goal and derived score consistently.
- [ ] Commentary uses the actual stored event minute.
- [ ] Statistics persist and update public viewer.
- [ ] Finished match rebuilds standings.
- [ ] Draft article is private; published article is public and linked to the selected competition/event.
- [ ] Notification outbox processes pending entries.
- [ ] Audit log records significant actions and filters work.
- [ ] Live Center works at approximately 390 x 844 without horizontal overflow.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] GitHub Actions is green.
- [ ] Real screenshots are captured from the running application for README/portfolio.
