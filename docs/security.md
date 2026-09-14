# Security notes

- Control Room routes require an Auth.js session in the server layout.
- Event and content mutation routes check the authenticated role server-side.
- Seed passwords are bcrypt hashes; plaintext values exist only as documented local demo inputs.
- `.env` is ignored; secrets belong in environment configuration and are never committed.
- Zod validates event, incident, statistics, and article input before persistence.
- Public news queries require `PUBLISHED`, so draft articles are not exposed by public routes.
- The current MVP uses credentials authentication and JWT sessions. Production deployment should add rate limiting, secure secret rotation, stronger account lifecycle controls, CSRF review, and an external identity provider if appropriate.
