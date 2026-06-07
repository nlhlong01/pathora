# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

This project uses **Yarn**, not npm (no `package-lock.json`).

- `yarn dev` — start dev server on http://localhost:3000 (Turbopack)
- `yarn build` — production build
- `yarn start` — run production build

There are no tests, no lint script, and no typecheck script wired up.

## Architecture

Pathora is a heritage-travel map of castles and fortresses across four German states (Hessen, Rheinland-Pfalz, Baden-Württemberg, Bayern). Single-page Next.js 16 App Router app.

### Data flow

```
Overpass API ──► lib/overpass.ts ──► app/api/castles ──► components/Map.tsx ──► Leaflet markers
                       │
                       └── 24h module-level cache (NOT Next.js fetch cache)

Wikimedia API ──► lib/wikimedia.ts ──► app/api/photo ──► components/PopupCard.tsx (on popup open)
```

### Key constraints and why

- **In-memory cache, not Next.js fetch cache** (`lib/overpass.ts`): the Overpass response is ~2.5 MB, which exceeds Next.js's default 2 MB cache limit. A module-level `cache` variable holds parsed `Castle[]` for 24h. Restart the dev server to bust it.
- **Overpass requires `User-Agent` header** or returns 406. Already set in `fetchCastles()`.
- **Overpass occasionally returns 504**. Retry — it's transient.
- **`MapWrapper.tsx` exists solely** so `Map.tsx` can be loaded with `ssr: false`. Leaflet touches `window` at import time; `ssr: false` cannot live inside a Server Component, so the wrapper is a thin Client Component bridge from `app/page.tsx`.
- **Castle interface is duplicated** in `lib/overpass.ts` and `components/Map.tsx`. Both must stay in sync.

### Tourist-relevance scoring filter

`scoreElement()` in `lib/overpass.ts` filters the Overpass response down from ~2,851 named castles to ~254. Each present OSM tag awards 1 point:
- `wikipedia` or `wikidata` — notability
- `opening_hours` — accessibility
- `website` — actively managed site
- `castle_type` ∈ {defensive, stately, palace} OR `historic=fortress` — notable type

Threshold: **score ≥ 3**. Adjusting this single number is the primary lever for map density. Note: for this dataset, `historic=fortress` and `castle_type=ruins` never appear — those branches are defensive/forward-looking.

### Popup rendering

`Map.tsx` mounts/unmounts `PopupCard` React roots per-marker on `popupopen`/`popupclose` to avoid mounting 254+ popup components upfront. Popups fetch their own Wikipedia photo lazily.
