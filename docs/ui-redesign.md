# UI redesign critique

## What was wrong

The first implementation framed live operations as a generic SaaS dashboard. Four decorative KPI cards came before the match, a dark permanent sidebar dominated the page, and the event itself was split across several rounded cards. Serif headings, pastel metric blocks, tiny secondary text, and Unicode pseudo-icons made the interface feel designed for a screenshot instead of an operator working under time pressure.

The route also kept the overview, event controls, live feed, commentary composer, and public page in one monolithic component. That made it difficult to give the Control Room and Live Center different information hierarchies.

## Direction for this pass

The match is now the primary object. Control Room uses a compact operations shell, a dominant match context bar, a chronological event feed, explicit fast-entry incident actions, and a separate publishing column. The overview answers live, upcoming, and needs action with rows and queues instead of KPI cards.

Live Center is a separate public surface with its own header, score treatment, timeline, and commentary layout. Both surfaces now read the same persisted event domain. Control Room mutations commit through server services, while Live Center receives SSE invalidation events and refreshes authoritative PostgreSQL state; the two products do not share the same dashboard composition.

The token system uses graphite ink, neutral surfaces, restrained borders, and one signal-lime live state. Red and amber remain reserved for semantic incidents and warnings. Typography is one sans family with mono timestamps and match-clock values.
