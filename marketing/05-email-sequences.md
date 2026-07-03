# 05 — Email Sequences

Four ready-to-load sequences. You have Resend wired (`RESEND_API_KEY`,
`/api/newsletter`). Copy is written for the SecretXperience voice (see
`10-brand-voice.md`): discreet, confident, warm, never crude. Merge fields in
`{{double_braces}}`.

> Compliance note: keep advertiser and client lists separate. Never imply
> on-platform payment for services. Always include an unsubscribe link and a
> neutral "From" name/descriptor.

---

## Sequence 1 — Advertiser Welcome (triggered on signup as advertiser)

**Goal:** get them verified and published fast (activation). 4 emails.

### Email 1 — immediately
**Subject:** Welcome to SecretXperience — let's get you live
**Body:**
Welcome, {{first_name}}.

You've joined a platform built differently: every advertiser is verified, you
keep 100% of what you earn (we never take commission), and your privacy is
protected by default.

Three steps to your first booking request:
1. Complete your profile — photos, description, rates, availability
2. Verify your identity — a quick ID selfie, reviewed within 24 hours
3. Go live — clients can find and message you directly

→ Finish your profile: {{profile_url}}

Most advertisers go live the same day. We're here if you need anything.

— The SecretXperience team

### Email 2 — +24h if not verified
**Subject:** One step left: get your verified badge
**Body:**
Hi {{first_name}},

Your profile is started — the last step is verification. It matters more than it
looks: verified profiles show a green badge, rank higher in search, and get
noticeably more messages, because clients trust them.

It takes two minutes: upload a government ID and a selfie. Our team reviews it
within 24 hours.

→ Verify now: {{verify_url}}

### Email 3 — +3 days if verified but no listing live
**Subject:** You're verified — time to be seen
**Body:**
{{first_name}}, you're verified. Now let's get clients seeing you.

Profiles with at least 4 photos and a written description get far more booking
requests than sparse ones. A few minutes of polish pays off.

Tip: mark yourself available in every city you serve — one profile can appear in
all of them.

→ Publish your listing: {{listing_url}}

### Email 4 — +7 days, founding-advertiser offer
**Subject:** A founding-advertiser perk for you
**Body:**
You're early — and early advertisers get the most attention while the platform
grows.

As a founding advertiser, here's {{founding_offer}} (e.g. a free Featured
placement for your first week) to put you at the top of search and the homepage.

→ Claim it: {{tokens_url}}

---

## Sequence 2 — Advertiser Nurture / Retention (weekly-ish, ongoing)

**Goal:** keep advertisers active, upgrading, and renewing. Rotate themes.

- **Performance nudge:** "You had {{view_count}} profile views this week. Here's
  how to turn views into bookings." (Links to tips + Featured upsell.)
- **Feature education:** one feature per email — Featured, Slider, live
  streaming, multi-city, the verified badge — with a concrete "why it earns you
  more."
- **Social proof:** "{{n}} new clients joined SecretXperience this week in
  {{country}}." (Supply responds to demand signals.)
- **Seasonal/timing:** events, weekends, local happenings that spike demand —
  "Antwerp has {{event}} this weekend; make sure your availability is current."
- **Win-the-top:** "3 advertisers in {{city}} upgraded to Featured this week.
  Don't get buried." (Gentle scarcity.)

---

## Sequence 3 — Client / Member Engagement (triggered on client signup)

**Goal:** activation → return visits. 3 emails. Keep it tasteful and useful.

### Email 1 — immediately
**Subject:** Welcome — discover, discreetly
**Body:**
Welcome to SecretXperience, {{first_name}}.

Everything here is built around two things: verified advertisers and your
privacy. Browse freely; when you message someone, your details stay yours until
you decide otherwise.

→ Start with Discover (swipe to save who catches your eye): {{discover_url}}
→ Or browse {{city}}: {{city_url}}

### Email 2 — +2 days
**Subject:** How to know a profile is real
**Body:**
A quick guide to browsing with confidence:
- Look for the green verified badge — that advertiser passed ID review.
- Use private messaging; never take contact off-platform before you're ready.
- Save favourites so you can come back to them.

→ Browse verified profiles in {{city}}: {{city_url}}

### Email 3 — +7 days
**Subject:** New this week near you
**Body:**
New verified advertisers joined in {{city}} this week.
→ See who's new: {{city_url}}
(You can update your city or preferences any time in your account.)

---

## Sequence 4 — Win-back (no activity 30+ days)

**Goal:** reactivate dormant advertisers or clients. 2 emails.

### Email 1
**Subject (advertiser):** Your profile is waiting — clients are searching
**Body:** It's been a while, {{first_name}}. There are clients browsing {{city}}
right now. Reactivate your profile in one click and get back in front of them.
→ {{reactivate_url}}

**Subject (client):** {{n}} new verified profiles since you were last here
**Body:** A lot has changed in {{city}}. Come see who's new — browsing is always
free and private. → {{city_url}}

### Email 2 — +5 days, last touch
**Subject:** Anything we can do better?
**Body:** We'd genuinely like to know what would make SecretXperience more useful
for you. Reply to this email — a real person reads it. And if now isn't the
time, no problem; you can unsubscribe below any time.

---

## Implementation notes
- Load as Resend broadcasts/automations or trigger transactionally via
  `/api/notify` patterns already in the codebase.
- Personalize `{{city}}` from the user's profile city — it materially lifts
  open/click rates in a location-based product.
- A/B test subject lines; the founding-advertiser and "X views this week" angles
  are usually the strongest.
- Keep advertiser vs client lists strictly separated.
