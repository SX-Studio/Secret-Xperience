# SecretXperience — Marketing Program

Everything in this folder was produced in one autonomous working session. It's
organized so you can skim the index, then open whatever you want to act on.

**Branch:** `claude/setup-marketplace-project-ypB9K` (NOT main — nothing here
auto-deploys to production; you review and merge when ready).

---

## The one-paragraph version

SecretXperience is a strong *build* with almost no *distribution* — the exact
trap the Greg Isenberg video ("Stop Vibe Coding, Start Getting Customers")
warns about. Because paid search/social is largely closed to adult, growth has
to come from owned + earned channels: **programmatic SEO, answer-engine
optimization (AEO), a content engine, newsletter acquisition, free tools, and a
referral loop.** The single highest-leverage move was already half-built — your
~130 programmatic city pages exist but were rendering thin/empty pre-launch.
This session fixed that with real per-city content + FAQ schema (shipped as
code), and laid out the rest of the engine as ready-to-execute playbooks.

---

## What's in this folder

| File | What it is | Status |
|------|-----------|--------|
| `01-audit-summary.md` | Marketing audit — score 58/100, where the gaps are | Read first |
| `02-keyword-map.md` | City × category keyword map, clusters, priorities, multilingual notes | Ready to use |
| `03-programmatic-seo.md` | The thin-content problem + the code fix shipped this session + expansion plan | **Code shipped** |
| `04-aeo-content-pack.md` | 25 citation-worthy Q&As for AI answer engines (+ where they go) | Ready to publish |
| `05-email-sequences.md` | 4 full sequences: advertiser welcome, advertiser nurture, client re-engagement, win-back | Ready to load into Resend |
| `06-content-calendar.md` | 30-day content calendar + the 1→50 repurposing engine | Ready to run |
| `07-newsletter-acquisition.md` | Buy-an-audience playbook: criteria, targets, outreach scripts, due diligence | Ready to outreach |
| `08-free-tools.md` | 2 free top-of-funnel tool specs (advertiser reach estimator + client city guide) | Specs ready to build |
| `09-viral-referral.md` | Shareable "advertiser stat card" artifact + referral loop design | Specs ready to build |
| `10-brand-voice.md` | Brand voice guide so all content stays consistent | Reference |
| `11-90-day-roadmap.md` | Week-by-week plan tying all 7 video strategies to your situation | The plan |

---

## Code shipped this session (on the feature branch)

| File | Change |
|------|--------|
| `app/lib/cityContent.ts` | NEW — per-city editorial content + FAQ generator for all 26 cities (BE/NL/DE/FR/LU/CH). Fixes thin-content across ~130 programmatic pages. |
| `app/escorts/[city]/page.tsx` | Renders the editorial intro + local areas + a visible FAQ, and emits `FAQPage` + `ItemList` schema (AEO). |

**Verified:** `cityContent.ts` typechecks clean; no new TS errors introduced.
The pattern is ready to roll out to the other 4 city categories
(`nightlife`, `hotels`, `rentals`, `private-reception`) — see `03-programmatic-seo.md`.

---

## If you only do three things

1. **Merge the programmatic-SEO content fix** (already coded) and roll it to the
   other 4 city categories. Biggest organic lever, and it removes a thin-content
   penalty risk. → `03-programmatic-seo.md`
2. **Start newsletter-acquisition outreach** — fastest path to a warm audience.
   → `07-newsletter-acquisition.md`
3. **Publish the AEO content pack** into your FAQ + city pages. First-mover in a
   wide-open niche. → `04-aeo-content-pack.md`

---

## Honesty notes (constraints this session ran under)

- **No live web access.** This environment blocks everything except GitHub/PyPI,
  so I could not crawl the live site or competitors, pull live keyword volumes,
  or verify current legal specifics per city. All site analysis is from the
  actual source code (reliable); keyword volumes and competitor specifics are
  domain-reasoned estimates flagged as such and should be validated with a live
  tool (`/keyword-research`, Ahrefs, DataForSEO) before betting budget on them.
- **Legal content was kept deliberately general.** City pages point to
  `/regulations` rather than asserting per-city law I can't verify. Have a human
  confirm legal framing per market before publishing.
- **Nothing is on main.** All code + docs are on the feature branch for review.
