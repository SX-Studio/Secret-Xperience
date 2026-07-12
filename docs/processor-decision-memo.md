# Payment-Processor Decision Memo — SecretXperience

**Purpose:** the one decision that unlocks real revenue. This memo frames the two viable
paths so the owner can choose. **The choice is a business call, not a technical one** —
this doc lays out the trade-offs and the concrete next action for each.

Related files: `docs/processor-outreach.md` (live broker threads + email template),
`Verotel_Questionnaire_SecretXperience.docx` (escorts-only path paperwork),
`CLAUDE.md` → "Payment processor compliance — VERIFIED FACTS".

## The situation (verified facts, not speculation)

- **Verotel** — will process an escort site **only if escorts is the sole vertical**.
  Explicitly refuses Massage, Nightlife, Rentals, Hotels, Events as co-verticals. We are
  already **live in Verotel test mode** (website #136440, full token flow verified). The
  only thing between us and live is compliance review — which requires the site to be
  escorts-only.
- **CCBill** — flat no for escorts. Dead end.
- **QuadraPay** (broker/ISO) — explicitly handles escort *listing* sites, EU/SEPA
  settlement. Thread is **live**: our pre-approval answers were sent 2026-06-06 and are
  awaiting their reply. They confirmed reseller/ISO, not a direct processor.
- Our monetisation model is **B2B advertising** (advertisers buy tokens to post/promote);
  no card payment for any in-person service passes through the platform. This is the
  compliance story that differentiates us from a booking platform — lead with it everywhere.

## Option A — Narrow to escorts-only, go live on Verotel

**What it means:** strip/hide the non-escort verticals (companionship, massage,
nightlife, rentals, hotels, events, shop, creators) so the public site is escorts-only,
then submit for Verotel live review.

| | |
|---|---|
| **Time to revenue** | **Fastest.** Verotel integration already works in test; live is a compliance review away. Days-to-weeks. |
| **Certainty** | **Highest.** Verotel already told us yes for this exact shape. |
| **Cost** | Low. Established rates, no high-risk broker markup or rolling reserve games. |
| **Downside** | Kills the multi-vertical positioning. Massage/companionship/nightlife/etc. content must come off the public site (can keep in DB, hidden). Narrows the brand and the addressable market. |
| **Reversibility** | Medium — you can re-expand later, but re-applying to processors after changing verticals is friction. |

**If chosen, the build is real but contained:** hide non-escort categories from nav,
homepage, sitemap, and category routes; keep the data. I can scope and do this.

## Option B — Keep multi-vertical, land a high-risk broker

**What it means:** keep the full marketplace and get placed with an acquiring bank via a
broker/ISO (QuadraPay is the live lead; Instabill, Merchant Advice Service are backups).

| | |
|---|---|
| **Time to revenue** | **Slower.** Underwriting, KYC, possible rolling reserve; weeks-to-months, and not guaranteed. |
| **Certainty** | **Lower.** Brokers advertise escort acceptance then sometimes decline at underwriting. QuadraPay is promising but unconfirmed. |
| **Cost** | Higher — high-risk rates, setup fees, likely a rolling reserve. |
| **Upside** | Preserves the full multi-vertical vision and larger market. |
| **Reversibility** | You keep optionality; can still fall back to Option A. |

**If chosen, the next action is comms, not code:** nudge the QuadraPay thread, and send
the outreach template to one backup broker (separately — never CC competitors).

## Crypto rail — do this regardless of A or B

No processor can decline crypto. **NOWPayments / BTCPay Server** can wire into the
existing token/wallet flow as a parallel rail — a revenue backstop that works even while
A or B is pending. Recommended as a hedge under either option. I can scope this.

## Recommendation

**Bias to Option A for speed, keep Option B alive in parallel, and add the crypto rail as
a hedge.** Rationale: you are pre-revenue with 1 completed order and ~4.2M test tokens
outstanding — the priority is *any* real revenue and a live processor, and Verotel is the
one confirmed yes we already have wired up. Narrowing to escorts-only is painful for the
vision but is the shortest, most certain path to money. Meanwhile the QuadraPay thread
costs nothing to keep warm; if it converts, you can re-expand.

Note the inventory already leans this way: **the vast majority of real listings are
escorts** (plus a few companionship/massage). An escorts-only public site would drop
relatively little live inventory.

## Immediate next actions

1. **Owner decides:** Option A (escorts-only + Verotel) vs. Option B (multi-vertical +
   broker). This memo exists to make that call.
2. **Enable the Gmail connector** (claude.ai connector settings — I can't authorize it
   from here) so I can draft/track the processor threads from `heyokanaga@gmail.com`.
3. **Nudge QuadraPay** — their reply to our 2026-06-06 pre-approval is outstanding; a
   short follow-up keeps it warm regardless of A/B.
4. If **A**: I scope the "hide non-escort verticals" change + prep the Verotel live
   submission from the questionnaire docx.
5. If **B**: I send the outreach template to one backup broker and prep the KYC pack.
6. **Either way:** scope the crypto rail (NOWPayments/BTCPay) as a revenue backstop.
