# cyber-terror-viz

An interactive visualization of state-sponsored cyber incident attribution
data — sponsors, threat actors, sectors, countries, and the relationships
between them.

**Live:** https://cyber-terror-viz.vercel.app

## What's inside

The app has three views, all keyboard-navigable (`1` / `2` / `3`):

1. **Overview** — a one-page intelligence brief with headline stats, a
   cumulative-incidents trendline, and rankings (top sponsors, actors,
   sectors, countries). Clicking any row jumps into the network graph
   focused on that entity.
2. **Network** — a D3 force-directed graph of the attribution network.
   Toggle between the **Sector** graph (sponsors → actors → sectors) and
   the **Geographic** graph (sponsors → actors → countries). Click a node
   to open a detail panel with the top related entities; drag to
   reposition; scroll to zoom.
3. **Timeline** — a racing bar chart of cumulative attributed incidents by
   sponsor, 2005–2025. Press play or scrub the year slider.

### Extra niceties

- **Natural-language query panel** on the network view ("which actors have
  multiple state sponsors?", "what does China target most?").
- **Keyboard shortcuts**: `/` focuses search, `Esc` clears selection, `E`
  exports the current graph to PNG, `1`/`2`/`3` switch tabs.
- **Shareable URLs**: the active view (and optionally a focused node) is
  persisted in the URL hash — e.g. `#network/APT%2028`.
- **PNG export** of the current graph at 2× resolution.

## Data

Four JSON files live in `public/` and drive the app:

| File                     | Used by            | Shape                                                    |
| ------------------------ | ------------------ | -------------------------------------------------------- |
| `sector_network.json`    | Network (sector)   | `{ nodes: [{id, type, degree}], links: [{source, target, weight, type}] }` |
| `geo_network.json`       | Network (geo)      | same shape; geo nodes go through a role-aware normalizer so the same country can appear as both a sponsor and a target without being treated as a single self-looping node |
| `node_details.json`      | Node detail panel  | `{ [nodeId]: { total_incidents, targets: {name: count}, sources: {name: count} } }` |
| `sponsor_timeline.json`  | Timeline + Overview | `[{ sponsor, year, cumulative }]` |

The data is open-source and assembled from public attribution reports. It
is **not** a comprehensive or authoritative record — treat it as a
research aid, not a source of truth.

## Tech stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
- [D3 v7](https://d3js.org/) for the force-directed graph and racing bars
- [Recharts](https://recharts.org/) for the overview charts
- ESLint with `react-hooks` and `react-refresh` plugins

## Development

```bash
npm install
npm run dev        # Vite dev server with HMR
npm run build      # Production build into dist/
npm run preview    # Serve the production build locally
npm run lint       # ESLint
```

## Project layout

```
src/
  App.jsx                     # view switcher + URL hash + global shortcuts
  App.css                     # theme + component styles
  main.jsx                    # React root
  components/
    Nav.jsx                   # top tab bar
    Overview.jsx              # landing dashboard (stats + trendline + rankings)
    NetworkGraph.jsx          # D3 force-directed graph
    NodeDetailPanel.jsx       # per-node drilldown with bar charts
    QueryPanel.jsx            # natural-language query sidebar
    RacingBarChart.jsx        # cumulative incidents over time
public/
  sector_network.json
  geo_network.json
  node_details.json
  sponsor_timeline.json
```

## Deployment

This project is wired for Vercel out of the box — `npm run build` emits a
static `dist/` directory that any static host can serve (Vercel, Netlify,
GitHub Pages, S3, etc.).
