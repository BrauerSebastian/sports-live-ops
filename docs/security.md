# Security notes

Implemented safeguards:

- Control Room requires a NextAuth session.
- Event, editorial, notification, and route-group capabilities are role-gated server-side.
- Event operations are ADMIN/OPERATOR capabilities; editorial management is ADMIN/EDITOR.
- Seed passwords are bcrypt hashes in the database; plaintext demo credentials are documentation-only local inputs.
- `.env` is ignored and `.env.example` contains placeholders/local defaults only.
- Zod validates lifecycle, clock, incidents/corrections, commentary, statistics, and editorial input.
- Participant ids used by incidents are verified to belong to the target event.
- Public article reads require `PUBLISHED`; React renders editorial body as escaped text paragraphs.
- Server-confirmed mutations prevent rejected operations from remaining as successful client state.

Production hardening still required:

- external identity/account lifecycle or stronger credential management;
- secret rotation;
- login/API rate limiting;
- CSRF/deployment review for the final hosting architecture;
- durable shared realtime transport;
- provider-specific notification security;
- production observability and backup/recovery procedures.
