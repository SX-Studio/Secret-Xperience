# 03 — Programmatic SEO (code shipped + expansion plan)

## What I found

Your programmatic SEO infrastructure already exists and is better than the audit
first credited:

- **Routes:** `/escorts/[city]`, `/nightlife/[city]`, `/hotels/[city]`,
  `/rentals/[city]`, `/private-reception/[city]` — plus country variants.
- **Coverage:** 26 cities × (BE/NL/DE/FR/LU/CH) and 6 countries.
- **Sitemap:** already emits ~130 city URLs + country URLs with priorities.
- **Schema:** city pages emit `ItemList` JSON-LD.
- **Country pages:** genuinely rich (hero, how-it-works, benefits, pricing,
  social proof, browse links). These are good.

## The problem (the important bit)

The **city** pages (not country) were **thin**. With no live listings yet — the
normal pre-launch state — each city page rendered only:

- an H1 ("Escort Girls [City]")
- one sentence ("0 verified providers available…")
- "No listings yet"
- link pills

That's ~130 near-identical, near-empty URLs. Two real risks:
1. **Google thin-content / doorway-page suppression** — clusters of templated
   empty pages can get the whole pattern devalued or deindexed.
2. **Zero AEO value** — nothing for ChatGPT/Perplexity to cite.

This is exactly the video's warning: *"make sure the content is good and doesn't
feel like AI… not just variable swaps, actual paragraphs."*

## What I shipped this session

**`app/lib/cityContent.ts` (new)**
- Unique, hand-written editorial for all 26 cities (tagline + 2-3 sentence intro
  + real local neighbourhoods). Primary EU markets richest.
- `getCityEditorial(slug, name)` — returns curated content or a unique,
  non-thin fallback so no page is ever empty.
- `cityFaq(name, category)` — 4 stable, useful Q&As per city (verification,
  discretion, pricing, how-to-advertise). Feeds both visible FAQ and schema.
- Content is factual and safety-oriented; **no unverifiable legal claims** —
  it points to `/regulations` instead.

**`app/escorts/[city]/page.tsx` (updated)**
- Renders the editorial intro + "Areas in [City]" chips below the H1.
- Adds a visible FAQ section.
- Emits `FAQPage` + `ItemList` via a single `@graph` JSON-LD block (AEO).
- Country-page layout untouched.

**Verified:** `cityContent.ts` typechecks clean; no new TS errors. The one
`tsc` warning on the city page (`[...new Set()]`, line ~114) is pre-existing and
appears 7× across the repo — a global tsconfig quirk Vercel's build handles.

## How to review / ship

1. Look at the diff on branch `claude/setup-marketplace-project-ypB9K`.
2. Eyeball a few city intros in `cityContent.ts` for tone/accuracy (especially
   anything that could read as a legal claim — I avoided them, but confirm).
3. Merge to main → Vercel deploys → spot-check `/escorts/brussels`,
   `/escorts/amsterdam`, `/escorts/berlin`.
4. Re-submit the sitemap in Google Search Console and request indexing for a few
   city URLs.

## Expansion plan (next, ~1-2 hrs each)

Roll the same pattern to the other 4 city categories. The content module is
built to support it — add category-specific editorial/FAQ and wire each page the
same way:

| Category | Page | Editorial angle |
|---|---|---|
| `nightlife/[city]` | venues/clubs | local nightlife districts, venue types, what to expect |
| `hotels/[city]` | discreet hotels | privacy features, areas, discretion guidance |
| `rentals/[city]` | private spaces | neighbourhoods, typical use, discretion |
| `private-reception/[city]` | home reception | what private reception means, local context, safety |

Then:
- **Localize intros + H1 + FAQ** into each city's dominant language (see
  `02-keyword-map.md`). Largest remaining SEO win after expansion.
- Add `hreflang` tags for language variants.
- Add `BreadcrumbList` schema to city pages (currently breadcrumb is visual only).
- Cross-link related cities (already partly done via "browse by city" pills).

## What NOT to do
- Don't mass-generate hundreds more cities with no editorial — that recreates the
  thin-content problem at larger scale. Depth per page beats page count.
- Don't state per-city legality you can't verify. Keep pointing to `/regulations`.
