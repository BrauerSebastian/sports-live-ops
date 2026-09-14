# Web quality checklist

Sports Live Ops includes a release-oriented web-quality layer in addition to the product functionality.

## The 20-point release checklist

| # | Requirement | Implementation | Verification |
| --- | --- | --- | --- |
| 1 | Privacy policy | `/privacy` explains authentication storage, optional analytics, Web Vitals, demo data, retention, and user choices. | Route + internal-link audit |
| 2 | Terms & conditions | `/terms` documents portfolio/demo terms, acceptable use, availability, and liability boundaries. | Route + internal-link audit |
| 3 | Secrets off the frontend | Secrets stay server-only; `.env.example` separates public variables and `check:secrets` rejects secret-like `NEXT_PUBLIC_*` names/private keys. | `npm run check:secrets` |
| 4 | Force HTTPS | Root `proxy.ts` redirects production HTTP to HTTPS; HSTS is sent in production. | Source audit + deployment smoke test |
| 5 | Cookie consent banner | Versioned consent UI defaults to necessary-only and gates optional analytics. | Browser smoke test |
| 6 | Meta titles + descriptions | Root metadata plus route-specific metadata for public pages; private/control surfaces are noindex. | Source audit |
| 7 | Social preview image | Generated 1200x630 Open Graph/Twitter image. | `/opengraph-image` / social debugger after deploy |
| 8 | Favicon | Custom `src/app/icon.svg`; starter favicon removed. | Browser smoke test |
| 9 | Sitemap + robots.txt | App Router `sitemap.ts` and `robots.ts`; sitemap includes public DB-backed routes when available. | `/sitemap.xml`, `/robots.txt` |
| 10 | Alt text on images | Raw image audit rejects `<img>` without `alt`; generated social image exports alt text. | `npm run check:images` |
| 11 | Compress images | No raster UI assets currently ship; future Next Image output prefers AVIF/WebP and raster assets over 300 KB fail the audit. | `npm run check:images` |
| 12 | Check page load speed | Compression, asset/CSS budgets, consented Core Web Vitals endpoint, and runtime metrics are in place. Final Lighthouse is deployment-dependent. | `npm run check:performance` + deployed Lighthouse |
| 13 | Fix color contrast | Core palette is automatically checked against WCAG AA; focus indicators are explicit. | `npm run check:contrast` |
| 14 | Make it mobile friendly | Explicit viewport, responsive Live Center/legal/consent layouts, and mobile breakpoints. | 390x844 visual smoke test |
| 15 | Custom 404 page | App Router `not-found.tsx` provides branded recovery links. | Visit a missing route |
| 16 | Fix broken links | Internal route scanner resolves static/template links and rejects placeholder `href="#"`. | `npm run check:links` |
| 17 | Form validation | Browser constraints plus server-side Zod validation; operations controls now carry matching practical limits. | Typecheck + form smoke tests |
| 18 | Spam protection | Login honeypot plus bounded failed-attempt throttling; documented as single-process demo protection. | Auth smoke test |
| 19 | Set up analytics | First-party page-view/Web Vitals analytics work after consent; optional GA4 also loads only after consent when configured. | Consent + network smoke test |
| 20 | One clear call to action | Live Center home promotes one context-aware primary CTA (`Watch live match`, `View competition`, or fallback `Open Control Room`). | Visual smoke test |

## Legal and privacy

- `/privacy` documents necessary authentication storage, optional analytics, Core Web Vitals, and demo-data handling.
- `/terms` documents portfolio/demo usage terms.
- `CookieConsent` defaults to no optional analytics. The choice is versioned in localStorage.
- Google Analytics is optional and loads only when both `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured and the visitor allows analytics.
- First-party page-view and Web Vitals endpoints accept only constrained, non-profile payloads.

## Security and transport

- Production HTTP requests are redirected to HTTPS by `proxy.ts`.
- Production responses include HSTS.
- Common security headers disable framing, MIME sniffing, unnecessary browser capabilities, and unsafe referrer leakage.
- Server credentials remain server-only. `npm run check:secrets` fails if secret-like environment names are exposed through `NEXT_PUBLIC_*`.
- Demo login includes a honeypot and a bounded in-memory failed-attempt limiter. This is a portfolio anti-abuse control, not a replacement for a distributed production rate limiter.

## Metadata and discoverability

- Root metadata provides a title template, description, Open Graph data, Twitter card data, creator information, and a canonical metadata base.
- Public event, competition, fixture, article, privacy, and terms pages provide page-specific metadata where useful.
- Control Room and login pages are noindex.
- `/robots.txt` disallows private/control/API surfaces.
- `/sitemap.xml` includes stable public routes and, when the database is available, public competitions, events, and published articles.
- `opengraph-image.tsx` and `twitter-image.tsx` provide a 1200x630 social preview.
- `icon.svg` is the project favicon.

## Accessibility and visual quality

- Core text/design-token contrast is checked with `npm run check:contrast`.
- Focus states apply to links, buttons, inputs, textareas, and selects.
- Reduced-motion preferences are respected.
- The public experience already includes responsive breakpoints and the root viewport is explicitly mobile-friendly.
- Raw image tags are audited for missing `alt` attributes with `npm run check:images`.

## Images and performance

The current application deliberately contains no raster UI assets. The social preview is generated by Next.js at runtime.

- Future `next/image` output is configured for AVIF and WebP.
- Raster assets over 300 KB fail `npm run check:images`.
- Public static assets and the main stylesheet have source-size budgets in `npm run check:performance`.
- Runtime Core Web Vitals (CLS, FCP, INP, LCP, TTFB) are reported only after analytics consent.
- Next.js response compression is explicitly enabled.

A production release should still run Lighthouse against the deployed URL because network latency, hosting, database location, CDN behavior, and third-party analytics cannot be represented accurately by source-level checks alone.

## Link and form quality

- `npm run check:links` validates literal internal links against App Router page routes and rejects placeholder `href="#"` links.
- Public/editorial forms use HTML constraints for immediate browser feedback and Zod validation at the server boundary.
- Login has email/password constraints, autocomplete semantics, a honeypot, and failed-attempt throttling.

## Main call to action

The Live Center home exposes one primary CTA:

- `Watch live match` when an event is live.
- Otherwise `View competition`.
- If no competition exists, `Open Control Room`.

Secondary navigation remains visually subordinate.
