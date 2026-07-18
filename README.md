# Crossings

**A citizen-science web app that turns scattered wildlife road-crossing and vehicle-collision reports into a live danger map and ranked, exportable mitigation recommendations.**

[Live demo](#) &middot; [Demo GIF](#)

<!-- TODO: replace the links above with the deployed Vercel URL and a demo GIF once recorded -->

---

## The problem

Wildlife-vehicle collisions kill an enormous number of animals every year and injure thousands of drivers, yet the data that could prevent them — police reports, individual driver memories, the occasional roadkill survey — is scattered, rarely mapped, and rarely connected to a decision about where to put a warning sign or a crossing structure. Transportation agencies know fencing, signage, and crossing structures work; the hard part is knowing exactly where to spend a limited budget.

**Crossings** aggregates crowdsourced sightings and collisions into a shared map, uses that map to find statistically meaningful hotspots, and turns each hotspot into a plain-language, exportable recommendation a town, county, or state DOT can actually act on. Scattered, invisible data → a shared map and hotspot analysis → concrete recommendations local authorities can use.

## How it works

1. **Report.** Anyone can add a report by clicking a spot on the map or using their device's location, then choosing what happened (a crossing sighting or a confirmed collision), the animal category, and a severity level. Reports save to the browser's local storage and appear on the map immediately.
2. **Map.** Every report — the seeded demo dataset plus anything submitted locally — plots on an OpenStreetMap base layer as a colored, sized marker, or as a heatmap layer showing incident density.
3. **Cluster.** A grid-based density clustering pass groups nearby reports into priority zones and ranks them by a composite score (see [Hotspot methodology](#hotspot-methodology)).
4. **Explore.** The Insights dashboard breaks the same filtered data down by time, category, and severity, and surfaces the top five zones by priority score. Date-range and category filters update the map and every chart together.
5. **Act.** Any zone can generate a one-page action report — location, incident counts, dominant category, time-of-day pattern, and a plain-language mitigation recommendation — printable or downloadable as a text file.

The app ships with a seeded, programmatically generated dataset (~184 reports) centered on **Grand County, Colorado**, along the CO-9 corridor between Kremmling and Green Mountain Reservoir — a real wildlife-vehicle collision corridor where Colorado Parks & Wildlife and CDOT have built underpasses and fencing after tracking mule deer and elk migration collisions. This gives the map and hotspot detection something realistic to find on first load.

## Tech stack

- **Vite + React + TypeScript** — app shell, strict typing throughout
- **Tailwind CSS v4** — styling, civic-tech/data-dashboard visual language
- **Framer Motion** — modal and transition animations
- **Leaflet + react-leaflet**, OpenStreetMap tiles — the map (no API key required)
- **leaflet.heat** — the density heatmap layer
- **Recharts** — the Insights dashboard charts
- **React Router** — client-side routing (Map / Insights / Methodology)
- **localStorage** — persistence for user-submitted reports; no backend

There is no custom backend. Everything — clustering, scoring, filtering, chart aggregation — runs client-side in the browser.

## Hotspot methodology

Hotspot detection is a grid-based density clustering pass — conceptually a simplified, grid-accelerated DBSCAN — implemented in [`src/utils/clustering.ts`](src/utils/clustering.ts):

1. Every report is projected to local x/y meters and dropped into a 500m square grid cell (the cell size plays the role of DBSCAN's `eps` neighborhood radius).
2. Adjacent occupied cells (8-connected) are flood-filled into connected components, so an elongated cluster following a road corridor merges into one zone instead of splintering into one blob per cell.
3. A component becomes a zone only if it contains at least 4 reports (DBSCAN's `minPts`, applied to the whole zone).

Each zone is ranked by a composite priority score on a 0–1 scale:

```
score = 0.45 × countNorm + 0.30 × severityNorm + 0.25 × recencyScore
```

- **countNorm** — the zone's incident count, min-max normalized against the busiest zone currently detected (a relative priority ranking among zones actually found, not an arbitrary absolute scale).
- **severityNorm** — average severity ÷ 3 (severity is recorded 1–3: near-miss, injury, fatality/high-hazard).
- **recencyScore** — exponential decay from the zone's most recent incident, halving every 180 days, so old activity matters less than incidents still happening.

The full write-up, including the reasoning behind the weights and the tool's data assumptions and limitations, is on the in-app [Methodology page](src/pages/AboutPage.tsx).

## Project structure

```
src/
  data/          seeded region config + deterministic sample-report generator
  types/         Report, Hotspot, Filters domain types
  utils/         clustering, geo projection, filtering, aggregation, recommendation engine, exports
  hooks/         useReports (seed + localStorage merge), useHotspots, useGeolocation
  context/       shared filter state (date range + category) across routes
  components/
    map/         Leaflet map, marker/heatmap layers, legend, layer toggle
    report/      report submission flow (form, modal, FAB)
    hotspots/    priority-zone panel, map overlay circles, action report modal
    dashboard/   Recharts chart components
    layout/      nav + filter bar
  pages/         Map (home), Insights (dashboard), Methodology (about)
```

## Running locally

```bash
npm install
npm run dev
```

```bash
npm run build     # type-check + production build
npm run preview   # serve the production build locally
```

## Deploying

The app is a static Vite build with no backend — deploy the `dist/` output to Vercel (or any static host). `vercel.json` includes a rewrite so client-side routes (`/dashboard`, `/about`) resolve correctly on direct load/refresh.

## Limitations

- Reports are crowdsourced and unverified — the app has no way to confirm a submission is accurate.
- The demo dataset is synthetic, not real collision records; it illustrates what the tool does with real data.
- Reports live in browser local storage, so they're private to one device and not aggregated across users — a production version would need a shared backend to deliver on the "crowdsourced" promise fully.
- Recommendations are a starting point for a field survey, not a replacement for one.

Full details on the [Methodology page](src/pages/AboutPage.tsx) in the app.
