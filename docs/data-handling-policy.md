# Data-Handling & Connector Policy — SecretXperience

**Status:** operating policy. Read before connecting any external service/connector or
before sending platform data to a third party. Owner: heyokanaga@gmail.com.

SecretXperience is an EU adult-services marketplace. It promises **discretion** to users
and providers and is subject to the **GDPR**. That makes every integration a
**data-sharing decision**, not just a convenience. This document sets the rule.

## The core rule

**Personally identifying data stays in Supabase. External connectors get aggregate /
marketing / ops data only.**

"Personally identifying data" (PII) here includes, non-exhaustively:
- Provider & customer real names, phone numbers, WhatsApp, email, addresses.
- Identity-verification documents and selfies (`identity_verifications`, the
  `identity-docs` storage bucket) — the most sensitive data we hold.
- Booking/meetup details, private messages, favourites tied to an identifiable person.
- Anything that links a real person to their use of an adult service.

## Data classification

| Class | Examples | Where it may live |
|---|---|---|
| **Sensitive PII** | ID docs, selfies, real names, phone/WhatsApp, private messages, meetup requests | **Supabase only.** Never exported to a third-party connector, spreadsheet, Drive, CRM, or analytics tool. |
| **Operational** | Aggregate counts, listing metadata (title, city, category, tier), revenue totals, funnel metrics with no personal identifier | May go to ops/analytics/BI tools **in aggregate**, no row-level PII. |
| **Marketing** | Campaign performance, ad spend, keyword/SEO data, social metrics | External marketing connectors are fine. |

## Connector rules

- **Supabase / Vercel** — core infra, trusted, hold everything. Fine.
- **Stripe** — payments for **clean verticals only** (rentals, hotels, events, shop).
  **Never** route escort / companionship / massage / domination through Stripe — it
  violates their ToS and risks account termination. Card payments are forbidden for
  those categories at both client and server level; keep it that way.
- **Gmail** — acceptable for **vendor/processor and B2B provider correspondence**
  (Verotel, QuadraPay, etc.). Do not bulk-export customer PII into email tooling.
- **Google Drive / CRM (HubSpot, Zoho, …)** — only if strictly necessary and only with
  **non-sensitive** business data. Do **not** store ID documents or customer identity
  data there. Prefer keeping ID docs in Supabase Storage behind signed URLs.
- **Marketing analytics (Supermetrics), SEO (Semrush/Ahrefs)** — fine; they consume
  aggregate/marketing data, not user PII.
- **Web/product analytics** — if added, prefer a **privacy-friendly, EU-hosted,
  cookieless** option (e.g. Plausible) over Google Analytics, and never send PII in
  event payloads or URLs.

## Practical guardrails

- When a task would send data to an external service, first ask: *does this row/field
  identify a real person?* If yes → it stays in Supabase.
- Signed URLs for ID docs should be short-lived where the flow allows.
- Don't paste customer/provider PII into third-party tools "just to get it done."
- If a connector *requires* PII to function, that's a signal it's the wrong tool for an
  adult platform — flag it to the owner rather than proceeding.

## Why this matters commercially, not just legally

Discretion **is** the product. A single leak of provider identity or customer data
would do more damage than any missed integration. The convenience of an external tool is
never worth compromising the one promise the platform is built on.
