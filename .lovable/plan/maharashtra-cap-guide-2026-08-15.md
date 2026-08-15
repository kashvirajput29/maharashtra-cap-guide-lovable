# Maharashtra CAP Guide

A six-page guidance site for MHT-CET CAP counselling, reading all dynamic content from the existing Supabase tables (`colleges` — 50 rows, `cutoffs` — 28 rows, `important_dates` — 15 rows). No new tables, no renames, no hard-coded college/cutoff/date data.

## One database prerequisite

The three existing tables currently have no public read access configured, so the site would show empty lists. A single migration adds read-only public access — enable row level security, grant read access to visitors, and add "anyone can read" policies. No table structure, columns, or rows are changed.

## Pages

1. **Home** (`/`) — headline "Your Maharashtra CAP Counselling, Simplified.", the short problem story, and three prominent buttons: View Colleges, CAP Process, Important Dates. Plus a light stats strip (counts of colleges / active activities) pulled from the database.
2. **Colleges** (`/colleges`) — cards showing name, city, district, university affiliation, tier badge, short description. Search by college name; filter by city (from data) and tier (Top Tier / Good Tier / Emerging). Clicking a card opens its detail page.
3. **College detail** (`/colleges/$collegeName`) — full college info (name, city, district, affiliation, tier, branches offered as chips, website link, description) followed by a cutoff table (Year, Branch, Category, Round, Closing Percentile) filtered to that college, with dropdown filters for year, branch, category and round. Empty-state message when a college has no cutoff rows yet.
4. **CAP Process** (`/cap-process`) — vertical timeline of the 8 steps, each labelled as a Student action or CAP Cell action with distinct badge colour and icon.
5. **Important Dates** (`/important-dates`) — activities grouped by round, timeline style, showing activity, start/end dates, official link, and a status badge (Active / Upcoming / Closed / Declared) with distinct colours.
6. **FAQ** (`/faq`) — 10 static accordion questions covering the listed topics.

Shared header nav (mobile sheet menu under a hamburger) and footer with a disclaimer pointing to the official CET Cell site.

## Design direction

Maharashtra-inspired identity without a government feel: deep indigo base with a saffron/marigold accent and warm off-white surfaces, generous spacing, rounded cards, clear tabular data, subtle transitions only. Fully responsive — cards stack on mobile, cutoff table scrolls horizontally.

## Technical notes

- Data is read through TanStack `createServerFn` functions in `src/lib/cap.functions.ts` using a server-side publishable-key Supabase client (public reads, RLS respected).
- Routes load via `queryClient.ensureQueryData` in the loader + `useSuspenseQuery` in the component; each route gets `errorComponent` and `notFoundComponent`.
- College detail routes by URL-encoded `college_name` (the tables are joined on that field); a missing college throws `notFound()`.
- Filtering/search happens client-side over the fetched list (dataset is small).
- Per-route `head()` metadata with unique titles and descriptions.
- Design tokens added to `src/styles.css`; no hard-coded colour utilities in components.
