# 08 — Free Top-of-Funnel Tools

The video's Strategy 3: a free tool that delivers instant value, captures a
contact, and routes to your product. "The tool is the marketing." You can
vibe-code each in a day on your existing Next.js + Supabase stack.

Two tools — one per side of the marketplace.

---

## Tool 1 — Advertiser "Reach Estimator" (supply-side, build first)

**Who:** people considering advertising. **Why it wins:** turns an abstract
"should I list?" into a concrete number, then routes to free signup.

**Flow:**
1. Inputs (no login): city (dropdown of your 26), category, optional rate.
2. Output: an estimate — "A verified Featured profile in {city} could reach
   ~{X} client views/week" + how you'd rank vs. unverified, basic vs Featured.
3. Capture: "Want a personalized projection + your first week Featured free?" →
   email → routes to `/listings/create`.
4. Shareable result card (ties into `09`).

**Data:** derive estimates from your own `listing_views` once you have data;
pre-launch, use transparent, conservative ranges per city/tier and label them as
estimates (honesty protects trust + processor story).

**Build notes:** new route `/tools/reach-estimator`, client form → small API that
returns the estimate, optional email capture into your newsletter table. No
scraping, no external APIs needed.

**SEO/AEO bonus:** ranks for "how much can I earn advertising as an escort
{city}" and feeds the advertiser keyword cluster (`02`).

---

## Tool 2 — Client "Discreet City Guide" / Finder (demand-side)

**Who:** clients browsing. **Why it wins:** instant value + email capture +
viral-ish sharing, and it deep-links into your city pages (SEO synergy).

**Flow:**
1. Inputs: city + a couple of taste filters (category, verified-only,
   available-now). No login.
2. Output: a curated, tasteful shortlist of verified profiles in that city + a
   short discreet "city guide" blurb (reuse `cityContent.ts`!).
3. Capture: "Save this shortlist / get notified when new profiles join {city}" →
   email.
4. Routes into the relevant `/escorts/[city]` page.

**Reuse:** the `cityContent.ts` module shipped this session already has the
per-city editorial + areas — this tool can render it directly. Low build cost.

**Build notes:** route `/tools/finder` or fold into `/discover` (which already
exists as a swipe page — consider a no-login "lite" entry point to it that
captures email on save).

---

## Free-tool calendar (the video's tip)
Treat free tools like a content calendar — ship one every few weeks:
- Reach Estimator (advertiser)
- Discreet City Guide (client)
- "Is my profile booking-ready?" grader (advertiser — scores photos/description completeness, like Ahrefs' free checkers)
- "Verification explainer / trust check" (client education + brand)

Each one: instant value → email capture → route to product → subtly shareable.

## Shared principles
- **No login to get value** — capture email *after* showing value, not before.
- **Honest numbers** — conservative, labelled estimates. Trust is your moat.
- **Every output is shareable** — see `09`.
- **Each tool deep-links** into the city/listing pages it's about (SEO juice).
