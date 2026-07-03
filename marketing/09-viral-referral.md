# 09 — Viral Artifacts + Referral Loop

The video's Strategy 5 (shareable artifacts) + the marketplace flywheel.
Question to design around: **"What does my user want to brag about?"** Make that
thing beautiful and shareable, with a subtle-but-present logo.

## Artifact 1 — Advertiser "Stat Card" (your Spotify Wrapped)

**Insight:** advertisers love proof they're in demand. You already track
`listing_views`. Turn it into a thing they screenshot and post.

**What it is:** an auto-generated, on-brand image:
> "This week on SecretXperience: **1,240 profile views** · top 5% in {city} ·
> {n} new booking requests" — with subtle SecretXperience mark.

**Where:** in the advertiser dashboard, a "Share my week" button generating the
card (and a pre-filled X/Twitter post). Weekly cadence creates a habit.

**Why it works:** every share is free, perfectly-targeted impressions (their
audience = potential clients AND other potential advertisers who see it
working). Logo subtle so people *want* to share it (the video's warning: big
logos don't get shared).

**Build:** generate via a serverless OG-image route (`@vercel/og` /
`next/og`) from the advertiser's real stats. ~1 day.

## Artifact 2 — Milestone moments
- "Verified ✓" badge card when an advertiser gets verified ("I'm verified on
  SecretXperience").
- "Featured this week" card.
- City "new arrival" card ("Now advertising in {city}").

Each is a small, branded, shareable image tied to a moment of pride.

## Artifact 3 — Client-side (tasteful, optional)
Clients share less in this vertical for privacy reasons — don't force it. A
light option: a sharable "saved shortlist" or a generic, non-identifying
"discover {city}" card. Keep it SFW and identity-safe.

---

## Referral loop (the marketplace flywheel)

You already have `/refer` and `/api/referrals/me` — turn it into a real loop.

**Advertiser → Advertiser (supply growth):**
- "Refer another advertiser → you both get {tokens}." Supply begets supply, and
  more supply = better client experience = more demand.
- Surface it right after a positive moment (first booking request, verification).

**Client → Client:** lower priority (privacy), but a simple "invite a friend,
both get {perk}" can work if framed discreetly.

**Two-sided tie-in:** pair referrals with the stat cards — an advertiser sharing
"1,240 views this week" *is* a referral ad to other advertisers. Add a subtle
"List free on SecretXperience" footer to shared cards.

## Measurement
- Track shares (UTM on the pre-filled post link), signups attributed to
  referral (you have `signup_sources` / acquisition attribution), and
  referral→verified conversion.

## Build priority
1. Advertiser stat card (highest leverage, uses data you already have).
2. Wire it into the referral footer.
3. Milestone cards.
4. Revisit client-side later.
