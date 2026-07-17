---
name: ad-intake
description: Turn a pasted provider "ID card" advertisement into a live SecretXperience listing in one step. Use when the user pastes an escort / companion / massage / gigolo profile (name, city, phone, age, stats, services, rates) or says "maak nieuwe listing", "create/add listing", "new ad", "ID kaart", "voeg deze advertentie toe". Handles category/meet-type mapping, GOLD→premium tier, tags, services, website, duplicate-guarded insert into Supabase, and returns the photo-upload link. Tailored to the EU adult-services marketplace.
---

# Ad Intake — SecretXperience

Convert a pasted provider advertisement (a "profielkaart" / "ID kaart" from another
escort site) into an approved, live row in the Supabase `public.listings` table, then
report a summary and the photo-upload link.

This replaces the manual `INSERT` we used to write by hand for every provider.

## Project facts (do not re-derive)

- **Supabase project id:** `duwuzaelmggldhkgoebn`. Insert with the Supabase MCP
  `execute_sql` tool (load it via ToolSearch: `select:mcp__Supabase__execute_sql`).
- **Table:** `public.listings`. These are **admin-seeded** rows → `profile_id = NULL`
  (no user account behind them), same shape as the existing Stella/Keron/Jullia rows.
- Escort-family categories (`escorts`, `companionship`, `massage`, `domination`) render
  through `app/listings/[id]/EscortProfile.tsx`. The right-sidebar shows phone, the
  `website` link, rates, and the `Profile Details` built from `tags`.
- **Payment rule (never break):** escorts / companionship / massage / domination are
  **meetup-only, no card payment**. Never wire Stripe/checkout to these.

## Steps

1. **Parse** the pasted ad into fields (below). If a required mapping is genuinely
   ambiguous (e.g. category, or bio age ≠ header age), pick the safe default, do the
   insert, and **flag it** in the report — don't block unless truly unclear.
2. **Build the INSERT** from the template below.
3. **Run it** via `execute_sql` with the duplicate guard intact.
4. **Report** the summary table + the photo-upload URL. Remind that photos pasted in
   chat cannot be attached — they must go through the upload page.

## Field mapping

| Listing column | From the ad | Rules |
|---|---|---|
| `title` | Headline / name | Keep it recognisable, e.g. `Stella Doux — …`, `Rodrigo XL`, `Sexy Melissa`. |
| `description` | Bio text | Keep readable English. **Escape single quotes by doubling** (`don''t`). Append: region-availability line (if listed), a `Rates: …` line, and `Available 24/7` if stated. Drop non-ASCII emoji that risk SQL issues. |
| `category` | Source label | `Escort …` → **escorts**; `Massage …` → **massage**; female "luxury company / private reception / companionship" with no "escort" word → **companionship**; domination-led → **domination**. When the source clearly says "Escort", use escorts even for gigolos. Ambiguous → pick + flag. |
| `subcategory` | context | `private reception` (receives at home) · `Independent` · `Touring` (travels / worldwide). |
| `meet_type` | context | **incall** = receives at home only · **outcall** = comes to you / "escort at your place" / "I don't host" · **both** = both. Unstated → `both`. Enum: `incall|outcall|both`. |
| `price_from` / `price_to` | rate list | Min and max EUR across all listed durations. Single rate → `price_from` set, `price_to` NULL. None → both NULL. |
| `currency` | — | `'EUR'`. |
| `city`, `country` | location | City = the base/departure city. `country='Belgium'` unless clearly elsewhere. |
| `verified` | "Verified" badge | `true` when present. |
| `age` | Age field | Integer. If the **bio** age differs from the structured **Age** field, use the structured field and flag the mismatch. |
| `contact_phone` | Phone | **Digits only** — strip `+`, spaces. e.g. `+32 471 51 36 40` → `32471513640`. Keep the country code as given; if it's not `32` (Belgium), keep it but **flag** it. |
| `website` | Website field | Store the **full `https://…` URL** in `website`. It renders as a "🌐 domain ↗" link in the Contact card (EscortProfile) and feeds the homepage/section banners. |
| `tier` + `placements` | **GOLD** marker | GOLD present → `tier='premium'`, `placements=ARRAY['premium']`. Otherwise `tier='basic'`, `placements=ARRAY[]::text[]`. |
| `status`, `active` | — | `'approved'`, `true`. |
| `images` | — | `ARRAY[]::text[]` — photos are uploaded separately (see end). |
| `services` | Massage/Foreplay/Intimate/Fetish/Other lists | Exact labels as text[]. Drop blank/fragment lines (`with condom` on its own line under a header, empty bullets). Keep real service names verbatim. |
| `tags` | stats + hours | See tag convention below. |

## Tag convention (drives the Profile Details panel + filters)

Build `tags` as a text[] with:

- `type:women` or `type:men` (from Gender: Wife/Female → women; Male → men)
- `orientation:straight` | `orientation:gay` | `orientation:bisexual`
- `'<height> cm'` e.g. `'172 cm'` · `'<weight> kg'` e.g. `'65 kg'` · `'<age>'` e.g. `'30'`
- hair colour lowercase (`'blonde'`, `'black'`, `'brown'`)
- ethnicity lowercase if given (`'western european'`, `'latina'`)
- nationality adjective lowercase (`'belgian'`, `'brazilian'`, `'russian'`, `'moldovan'`, `'romanian'`, `'colombian'`, `'italian'`)
- each language lowercase (`'dutch'`, `'french'`, `'english'`, `'spanish'`, `'portuguese'`, `'italian'`, `'russian'`)
- working hours per day: `'wh:<day>:<open>-<close>'`, days `mon tue wed thu fri sat sun`.
  Hours as integers; **midnight open = 0, midnight/`00:00` close = 24**, `24/24` = `0-24`.
  e.g. Mon 10:00–00:00 → `'wh:mon:10-24'`; Fri 24/24 → `'wh:fri:0-24'`.

## INSERT template

Fill the placeholders, keep the `WHERE NOT EXISTS` duplicate guard, and `RETURNING`.

```sql
INSERT INTO public.listings (
  profile_id, title, description, category, subcategory,
  price_from, price_to, currency, city, country,
  verified, meet_type, age, contact_phone, website,
  tier, placements, status, active, images, services, tags
)
SELECT
  NULL,
  '<TITLE>',
  '<DESCRIPTION — double single-quotes>',
  '<escorts|companionship|massage|domination>', '<subcategory>',
  <price_from|NULL>, <price_to|NULL>, 'EUR', '<City>', 'Belgium',
  true, '<incall|outcall|both>', <age|NULL>, '<digits>', <'https://…'|NULL>,
  '<basic|premium>', ARRAY[<'premium'| >]::text[], 'approved', true,
  ARRAY[]::text[],
  ARRAY[ <'Service A','Service B',…> ]::text[],
  ARRAY[ <'type:women','orientation:straight','172 cm', … ,'wh:mon:10-24', …> ]::text[]
WHERE NOT EXISTS (
  SELECT 1 FROM public.listings
  WHERE contact_phone = '<digits>' OR title ILIKE '<TITLE prefix>%'
)
RETURNING id, title, category, city, price_from, price_to, meet_type, tier, website, status, active,
          array_length(services,1) AS n_services;
```

If there is no website, omit it from the column list (or pass `NULL`) and use
`ARRAY[]::text[]` for `placements` when not GOLD.

## Pulling photos from a source link (RedLights etc.)

When the ad comes as a **URL** (e.g. a RedLights profile) rather than pasted text,
also pull the provider's photos automatically instead of asking for a manual upload:

1. `WebFetch` the URL for the structured profile data.
2. Get the page HTML (`curl -A "Mozilla/5.0"`) and find the **profile's own** gallery.
   On RedLights, images are `https://a.rl.be/photos/<w>/<h>/c/<galleryId>/<name>-<ts>.jpg`.
   The profile's gallery is the `galleryId` with **by far the most images** (related
   listings show only 1 thumbnail each) — do NOT grab the related-listing thumbnails.
3. Download the first ~5 distinct photos at a **large size** — the CDN accepts arbitrary
   dimensions, so request `900/1200` (bigger than the 100/100 / 380/418 thumbnails on
   the page). Send `-e "https://www.redlights.be/"` as referer.
4. Save to `public/ads/<slug>-1..N.jpg`, verify each is a real JPEG (`file`), and
   **eyeball photo 1** (Read the image) to confirm it's the right person.
5. **Crop the watermark** — RedLights burns a "REDLIGHTS" logo bottom-left. Remove the
   bottom ~7% of every image (Pillow: `im.crop((0,0,w,int(h*0.93)))`). This is the
   **standing default** for RedLights pulls — always do it, don't ask each time.
6. Commit the images to the repo, push, and set the listing `images` array to the
   `/ads/<slug>-N.jpg` paths.
7. Delete temporary download files (the hosted `public/ads` copies stay — they ARE the
   photos; never delete those or the card goes blank).

Only falls back to the manual upload page when a source blocks downloads (login-gated
sites like OnlyFans behind a paywall). Pillow isn't preinstalled — `pip install Pillow`.

## After the insert — always report

Return a compact table: **ID, category/subcategory, location + age + gender, rates,
meet type, tier (⭐ if premium), contact + 🌐 website, service count, status**.

Then the photo-upload link:

```
https://secretxperience.eu/admin/listing-photos?listing=<ID>
```

State plainly: **photos pasted into chat cannot be attached** — the provider's images
must be uploaded through that page (admin login → drop photos → "Place photos"), or
delivered as files/URLs. First photo = cover.

## Data-fidelity rules (flag, don't silently "fix")

- **Non-Belgian phone** (not `32…`) — keep as given, flag it.
- **Age bio vs field mismatch** — use the structured field, flag it.
- **Burned-in text on a photo** (e.g. a price overlay) — flag so the user can choose to skip it.
- **Provider says "I don't send photos"** — note the listing will stay photo-less by choice; that's expected, not a gap.
- **GOLD** → premium automatically (standing rule; don't re-ask each time).
- **Website present** → always populate `website` (standing rule).

## Duplicates & multiples

If the user asks for a provider that already exists (same phone or title), don't create
a second row — surface the existing listing and ask whether it's an edit or a genuinely
different person. Verify with a quick `SELECT … WHERE title ILIKE '…' OR contact_phone='…'`.
