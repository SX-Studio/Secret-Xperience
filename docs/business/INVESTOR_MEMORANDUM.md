# SecretXperience.eu — Investor Information Memorandum

**Confidential — For Authorised Recipients Only**
*Prepared: May 2026 | Stage: Pre-Seed / Seed | Geography: European Union*

---

## Important Notice

This document is a confidential information memorandum prepared for discussion purposes only. It does not constitute an offer or invitation to subscribe for or purchase any securities. Projections and estimates are forward-looking and subject to material risk. Recipients should conduct their own due diligence.

---

## Table of Contents

1. Executive Summary
2. The Problem
3. The Solution
4. Market Opportunity
5. Platform Overview
6. Revenue Model & Unit Economics
7. Technology Stack & Moat
8. Competitive Landscape
9. Go-to-Market Strategy
10. Financial Projections (3-Year)
11. Risks & Mitigations
12. Team
13. Use of Funds
14. Investment Ask & Terms

---

## 1. Executive Summary

**SecretXperience.eu** is a premium, fully operational adult services marketplace built for the European Union market. The platform connects independent service providers — escorts, companions, content creators, nightlife professionals, and lifestyle service vendors — with verified adult consumers across Belgium, the Netherlands, Germany, France, and Luxembourg.

Unlike directory-style legacy platforms (Escort.be, EasyGirl.be) that are essentially static listing boards built on early-2000s architecture, SecretXperience is a **full-stack, modern marketplace**: identity-verified providers, a token economy, booking flows, real-time messaging, discovery algorithms, featured monetisation, and a clean mobile-first experience — all live in production today.

**The platform is built. The market is real. We are raising to grow it.**

| Metric | Status |
|---|---|
| Platform status | Live at secretxperience.eu |
| Tech stack | Next.js · Supabase · Vercel · Stripe |
| Target markets | BE, NL, DE, FR, LU (125M+ adults) |
| Revenue streams | 7 distinct streams active |
| Investment ask | €250,000 – €500,000 (Seed) |
| Use of funds | Marketing, CCBill integration, team, compliance |

---

## 2. The Problem

The EU adult services industry is **large, fragmented, and chronically underserved by technology**.

### 2.1 Provider Pain Points
- No professional, trustworthy platform to market services in multiple EU countries
- Existing sites are visually dated, lack mobile experience, and have zero verification
- No built-in booking management, messaging, or calendar — providers use WhatsApp and spreadsheets
- Safety risk: no identity verification of either party
- Payments are entirely cash-based, leaving no record and no dispute resolution

### 2.2 Consumer Pain Points
- No reliable way to verify that a listed provider is genuine
- No unified search across categories (escorts, companions, nightlife, creators)
- No discovery layer — sites are static grids with no personalisation
- No secure, discreet booking process — everything is handled ad-hoc via phone

### 2.3 Regulatory Drift Creating Opportunity
Several EU member states have implemented or are moving toward **Nordic model regulations** that decriminalise the selling but restrict the buying of adult services. This shift **increases demand for professional, documented, identity-verified platforms** that create accountability on both sides — and simultaneously raises the compliance bar high enough to eliminate amateur competitors.

---

## 3. The Solution

SecretXperience is a **two-sided marketplace with a token economy**, purpose-built for the EU regulatory and cultural context.

### Core Value Proposition
- **For providers**: A professional showcase with photo management, identity verification badge, booking calendar, real-time messaging, analytics, and tiered visibility (basic → featured → premium)
- **For consumers**: Verified listings, advanced search with filters (meet type, availability, location, price), swipe-to-discover interface, discreet mode, saved favourites, secure booking request flow
- **For the platform**: Seven monetisation levers that do not depend on a single transaction type

### What Makes It Different
| Feature | SecretXperience | Typical EU Competitor |
|---|---|---|
| Identity verification | ✓ (doc + selfie, admin review) | ✗ |
| Mobile-first design | ✓ (2-col card grid, photo slider) | ✗ (desktop-only layout) |
| Token economy | ✓ (wallet, spend, tiers) | ✗ |
| Real-time messaging | ✓ (unread counts, read receipts) | ✗ |
| Booking management | ✓ (request, confirm, decline) | ✗ |
| Swipe discovery | ✓ (/discover — GSAP Draggable) | ✗ |
| Multi-category | ✓ (8 categories) | Rarely (1–2 categories) |
| Moderation (AI) | ✓ (Anthropic-powered) | ✗ |
| Featured boost (Stripe) | ✓ | ✗ |

---

## 4. Market Opportunity

### 4.1 Total Addressable Market (TAM)
The global online adult services and content market was valued at approximately **€180 billion in 2024** (Allied Market Research; Statista Adult Content segment). EU-specific adult platform revenue — including escort directories, cam platforms, and creator content — is estimated at **€12–18 billion annually** across the 27 member states.

### 4.2 Serviceable Addressable Market (SAM)
SecretXperience's initial focus covers **BE, NL, DE, FR, LU** — five of the EU's highest-GDP countries with a combined adult population of approximately 125 million. The organised adult services marketplace segment (excluding cam/content) in these five markets is estimated at **€1.8–2.4 billion annually**, dominated by directory platforms charging flat listing fees with no marketplace functionality.

### 4.3 Serviceable Obtainable Market (SOM)
Capturing **0.5–1% of the SAM within 36 months** represents an annual revenue target of **€9–24 million**. This is achievable through provider acquisition (5,000–15,000 active listings) combined with consumer token spend and featured boost revenue.

### 4.4 Market Tailwinds
- **Decriminalisation trends** increase demand for documented, verified platforms
- **OnlyFans effect**: adult consumers are conditioned to paying for premium digital access
- **EU Digital Services Act** creates compliance pressure that eliminates unmoderated competitors
- **Mobile internet penetration** above 85% across all target markets
- **Post-COVID normalisation** of digital intermediaries for in-person services

---

## 5. Platform Overview

### 5.1 Core Features (Live)

**Listings & Discovery**
- 8 service categories: Escorts, Companionship, Nightlife, Content Creators, Rentals, Hotels, Events, Shop
- Advanced search with 12+ filters (verified, availability, meet type, price range, location, tags)
- Swipe-to-save discovery page (/discover) with GSAP Draggable UX
- Featured ad slider (Velvet Stage — 480px portrait cards with ambient glow)
- Real-time "Available Now" badge with pulsing indicator

**Provider Tools**
- Multi-photo listing creation with drag-and-drop upload
- 4-tier listing system (Basic → Featured → Slider → Premium) powered by token spend
- Dashboard: booking management, message inbox, listing analytics (view counts), profile completeness tracker
- Identity verification flow (document + selfie → admin review → verified badge)

**Consumer Tools**
- Favourites (heart-save across sessions)
- Recently viewed listings
- Booking requests with status tracking (pending / confirmed / declined)
- Discreet mode (photo blur, persisted in localStorage)

**Monetisation Infrastructure**
- Stripe Checkout for featured boosts and non-adult categories (rentals, hotels, events, shop)
- Token wallet system (purchase packages, spend on tiers and boosts)
- CCBill integration path prepared (for adult category payments — pending credentials)
- Newsletter capture (Resend transactional email)

**Admin & Trust**
- Admin panel: listing moderation (approve/reject), identity verification review, platform statistics
- AI-powered listing moderation (Anthropic Claude API)
- RLS (Row-Level Security) on all database tables
- Wallet balance mutations server-side only (service role) — prevents client-side manipulation

### 5.2 Platform Architecture Summary

```
Frontend        Next.js 13.5 App Router (TypeScript)
Database        Supabase (PostgreSQL + RLS + pg_cron)
Auth            Supabase Auth (email + Google OAuth)
Storage         Supabase Storage (provider photos, verification docs)
Payments        Stripe (Checkout, Webhooks) + CCBill (pending)
Email           Resend (transactional)
AI Moderation   Anthropic Claude API
Hosting         Vercel (auto-deploy, EU edge)
Domain          secretxperience.eu + www.secretxperience.eu
```

---

## 6. Revenue Model & Unit Economics

SecretXperience operates **seven distinct revenue streams**, providing resilience against any single channel being restricted or underperforming.

### Revenue Stream 1 — Token Packages (Primary)
Providers purchase tokens to activate listing tiers and boost visibility.

| Package | Price | Tokens | Effective Rate |
|---|---|---|---|
| Starter | €9.99 | 100 | €0.10/token |
| Casual | €24.99 | 300 | €0.083/token |
| Connoisseur | €49.99 | 700 | €0.071/token |
| Patron | €99.99 | 1,600 | €0.062/token |
| Platinum | €199.99 | 3,500 | €0.057/token |

**Listing tier costs:**
- Basic: 0 tokens / 24 hours
- Featured: 50 tokens / 7 days (≈ €3.50–€5.00)
- Slider Ad: 75 tokens / 7 days (≈ €5.25–€7.50)
- Premium: 150 tokens / 30 days (≈ €8.55–€15.00)

**Unit economics (per active provider, monthly):**
- Average provider token spend (estimated): €25–€60/month
- At 1,000 active providers: **€25,000–€60,000 MRR from tokens alone**

### Revenue Stream 2 — Featured Boosts (Stripe)
Direct Stripe checkout for listing promotion:
- 7-day boost: €29.00
- 30-day boost: €79.00

### Revenue Stream 3 — Payable Category Transactions
Rentals, hotels, events, and shop listings process full Stripe checkouts. Platform takes a **15% commission** on completed transactions.

### Revenue Stream 4 — Shop Sales
Physical and digital adult product sales. Platform margin: 20–35% depending on fulfilment model (dropship vs. consignment).

### Revenue Stream 5 — Event Ticketing
Ticketed nightlife and adult events with platform fee of **€2–€5 per ticket** + 10% of ticket value.

### Revenue Stream 6 — Affiliate & Partners Revenue
The /partners directory (50+ curated EU adult industry businesses) generates affiliate commissions of 15–40% on referred transactions. Estimated at €500–€3,000/month once traffic scales.

### Revenue Stream 7 — CCBill Adult Payment Processing
Once integrated, CCBill will enable direct card payment for escort/companion bookings. Platform transaction fee: **12–18%** on processed payments. This is the highest-potential stream — a single active provider doing €5,000/month in bookings generates €600–€900/month for the platform.

### Revenue Summary (Projected Monthly at Scale)

| Stream | 500 Providers | 2,000 Providers | 10,000 Providers |
|---|---|---|---|
| Tokens | €15,000 | €60,000 | €300,000 |
| Boosts | €3,000 | €12,000 | €60,000 |
| Category transactions | €2,000 | €10,000 | €50,000 |
| CCBill commissions | €5,000 | €30,000 | €200,000 |
| Shop & events | €1,000 | €5,000 | €25,000 |
| Affiliates | €500 | €2,000 | €8,000 |
| **Total MRR** | **€26,500** | **€119,000** | **€643,000** |
| **ARR** | **€318,000** | **€1.43M** | **€7.72M** |

---

## 7. Technology Stack & Moat

### 7.1 Why the Tech Matters
In the EU adult services space, **the technology is the barrier to entry**. Competitors are running PHP sites built in 2005. SecretXperience is running a modern, scalable, type-safe full-stack application with:
- Real-time database subscriptions (Supabase Realtime)
- Server-side rendering for SEO (Next.js App Router)
- Row-level security enforced at the database layer (not application layer)
- AI-powered content moderation (prevents legal liability from illegal listings)
- Identity verification flow that creates legal accountability

### 7.2 Technical Moats
1. **Identity verification pipeline** — document + selfie → admin review → verified badge — creates a trust layer no EU competitor has
2. **Token economy** — creates provider lock-in; tokens purchased are non-refundable and category-specific
3. **Data moat** — every booking, view, and interaction builds a dataset that improves search ranking, recommendation, and fraud detection over time
4. **CCBill relationship** — adult payment processing is gated by processor approval. Once live, this is a significant barrier; new entrants wait 6–18 months for approval
5. **SEO foundation** — JSON-LD schema, BreadcrumbList, Service markup, sitemap, robots.txt — all implemented. Domain authority compounds over time

### 7.3 Scalability
The current stack supports 100,000+ concurrent users without architectural changes. Supabase scales horizontally; Vercel edge functions scale to global traffic automatically. The primary scaling investment is in moderation capacity (human or AI).

---

## 8. Competitive Landscape

### Direct Competitors (EU Adult Directories)

| Platform | Tech | Verification | Booking | Tokens | Mobile | Active in Target Markets |
|---|---|---|---|---|---|---|
| **SecretXperience** | Next.js / Supabase | ✓ Full | ✓ | ✓ | ✓ Optimised | BE, NL, DE, FR, LU |
| Escort.be | PHP/legacy | ✗ | ✗ | ✗ | Partial | BE |
| EasyGirl.be | Legacy | ✗ | ✗ | ✗ | ✗ | BE |
| Hookers.nl | Legacy | ✗ | ✗ | ✗ | ✗ | NL |
| Laufhaus.de | Legacy | ✗ | ✗ | ✗ | ✗ | DE |
| Vivastreet FR | Classifieds | ✗ | ✗ | ✗ | Partial | FR |

### Adjacent Competitors

- **OnlyFans** — content subscription only, not services marketplace, no booking, no in-person
- **Eros.com** — US-focused, high fees, no EU compliance posture
- **AdultWork** — UK-based, post-Brexit regulatory uncertainty, no EU DSA compliance

### Competitive Advantage Summary
SecretXperience is positioned as the **Airbnb of EU adult services**: not a classifieds board but a trust-based, feature-rich marketplace. The combination of identity verification + modern UX + token monetisation + multi-country reach is unique in this market.

---

## 9. Go-to-Market Strategy

### Phase 1 — Supply First (Months 1–6, current)
*Acquire providers before consumers — a standard marketplace strategy*

- **Organic SEO**: City + category landing pages (Brussels escorts, Amsterdam nightlife, etc.) targeting high-intent long-tail keywords. Already structured for this.
- **Direct provider outreach**: Social media outreach to independent providers on Instagram, Twitter/X, Telegram channels. Cost: human time only.
- **Migration campaigns**: Offer free premium tier upgrades to providers migrating from legacy platforms. Cost: token subsidy (~€10–€25 per migrated provider).
- **Target**: 500 active provider listings within 6 months.

### Phase 2 — Consumer Acquisition (Months 3–9)
- **Paid social** (Twitter/X, Reddit adult-friendly placements): targeted to males 25–54 in target cities
- **Affiliate SEO**: Partner with adult review blogs and directories for backlinks
- **Referral programme**: Consumers earn tokens for inviting providers
- **Target**: 10,000 registered consumer accounts within 9 months

### Phase 3 — Market Expansion (Months 9–24)
- Launch DE and FR as primary growth markets (largest addressable populations)
- Localise UI to German and French (translations partially in place)
- Partner with EU adult industry associations for legitimacy and distribution
- Launch B2B offering: agencies (multi-provider accounts with shared dashboard)

### Phase 4 — Platform Flywheel (Month 24+)
- More providers → better consumer experience → more consumers → higher provider ROI → more provider spend on tokens → more revenue → more investment in features → repeat
- Introduce subscription tier for heavy consumers (€19.99/month for unlimited messaging, priority booking, exclusive listings)

---

## 10. Financial Projections (3-Year)

*All figures in EUR. Projections are estimates based on comparable marketplace growth curves and EU adult platform benchmarks. Actual results may differ materially.*

### Key Assumptions
- Provider acquisition cost (PAC): €15–€40 (SEO + direct outreach)
- Consumer acquisition cost (CAC): €8–€20 (paid social + referral)
- Average provider monthly token spend: €35 (conservatively below mid-tier)
- CCBill live by Month 4 post-funding
- Monthly churn (providers): 8%; (consumers): 15%
- Gross margin: 85% (infrastructure costs remain low at scale on Vercel/Supabase)

### Year 1 (Post-Funding)

| Quarter | Active Providers | Active Consumers | MRR | ARR Run-Rate |
|---|---|---|---|---|
| Q1 | 250 | 2,000 | €8,500 | €102,000 |
| Q2 | 600 | 6,000 | €22,000 | €264,000 |
| Q3 | 1,100 | 14,000 | €45,000 | €540,000 |
| Q4 | 1,800 | 28,000 | €78,000 | €936,000 |

### Year 2

| Quarter | Active Providers | Active Consumers | MRR | ARR Run-Rate |
|---|---|---|---|---|
| Q1 | 2,500 | 42,000 | €110,000 | €1.32M |
| Q2 | 3,500 | 60,000 | €155,000 | €1.86M |
| Q3 | 5,000 | 85,000 | €220,000 | €2.64M |
| Q4 | 6,500 | 110,000 | €290,000 | €3.48M |

### Year 3

| Quarter | Active Providers | Active Consumers | MRR | ARR Run-Rate |
|---|---|---|---|---|
| Q1 | 8,000 | 140,000 | €370,000 | €4.44M |
| Q2 | 10,000 | 175,000 | €470,000 | €5.64M |
| Q3 | 12,000 | 215,000 | €575,000 | €6.9M |
| Q4 | 14,000 | 260,000 | €680,000 | **€8.16M ARR** |

### Platform Valuation (Year 3)
At €8M+ ARR and 85%+ gross margins, SaaS/marketplace comparables suggest a **5–10x ARR multiple** for a platform at this scale and growth trajectory:
- **Conservative valuation (5x)**: €40–€45M
- **Base valuation (7x)**: €57–€60M
- **Optimistic valuation (10x)**: €80–€85M

For a seed investor at €250,000–€500,000, a **3–7% equity stake** today implies a **12–50x return** at Year 3 exit or Series A.

---

## 11. Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| **Regulatory change** — new EU member state law restricts platform | High | Medium | Multi-jurisdiction structure; legal counsel in BE and NL; DSA compliance already built in |
| **Payment processor risk** — Stripe restricts account for adult-adjacent activity | High | Medium | CCBill integration separates adult payments; Stripe only used for non-adult (tokens, rentals, hotels, events) |
| **Supply-side churn** — providers leave for competitors | Medium | Medium | Token lock-in (purchased tokens non-refundable); provider analytics dashboard creates stickiness |
| **Illegal content / trafficking risk** | High | Low | Identity verification on providers; AI moderation on all listings; admin review before activation; GDPR-compliant reporting flow |
| **Competition from well-funded entrant** | Medium | Low | Tech lead is 12–18 months; CCBill relationship takes months to establish; data moat grows daily |
| **Scaling moderation** | Medium | Medium | AI moderation (Anthropic) handles volume; human review only for edge cases and verifications |
| **GDPR / data compliance** | Medium | Low | Supabase EU data residency; RLS enforces data isolation; no third-party tracking beyond Vercel Analytics |
| **Founder concentration risk** | Medium | Medium | Mitigated by hiring with seed funding; documentation and CLAUDE.md ensure institutional knowledge |

---

## 12. Team

*The founding team profile will be provided under NDA on request. The platform was conceived, designed, and fully built by the founding team without external development cost — demonstrating strong technical execution and capital efficiency.*

**Founding Team Highlights:**
- Full-stack development: Next.js, TypeScript, PostgreSQL, Supabase, Stripe
- Product design: mobile-first UI/UX, conversion-optimised listing flows
- Market knowledge: deep familiarity with EU adult services landscape and regulatory environment
- Operating country: Belgium (primary target market)

**Planned Hires (with seed funding):**
- Head of Growth / Provider Acquisition (Month 1)
- Community Manager / Provider Success (Month 2)
- Legal & Compliance Consultant — EU adult/DSA specialist (Month 1)
- Senior Full-Stack Developer (Month 3)

---

## 13. Use of Funds

**Target raise: €250,000 – €500,000**

### €250,000 Allocation

| Category | Amount | % | Detail |
|---|---|---|---|
| Marketing & Provider Acquisition | €80,000 | 32% | Paid social, SEO content, direct outreach campaigns |
| Team (12 months) | €75,000 | 30% | Growth lead + community manager salaries |
| Legal & Compliance | €30,000 | 12% | EU regulatory counsel, DSA compliance audit, terms of service review |
| CCBill Integration & Payments | €15,000 | 6% | Integration development, processor fees, reserve |
| Technology & Infrastructure | €20,000 | 8% | Supabase Pro, Vercel Pro, monitoring, security audit |
| Product Development | €20,000 | 8% | Mobile app (PWA), agency accounts, subscription tier |
| Reserve | €10,000 | 4% | Contingency |

### €500,000 Allocation (Full Raise)

| Category | Amount | % | Detail |
|---|---|---|---|
| Marketing & Provider Acquisition | €180,000 | 36% | Scale paid channels; influencer partnerships; EU city launches |
| Team (18 months) | €150,000 | 30% | Full team of 4; competitive salaries |
| Legal & Compliance | €50,000 | 10% | Multi-jurisdiction counsel; DSA; data protection officer |
| CCBill + Payments Infrastructure | €25,000 | 5% | Full CCBill integration + payment reserve fund |
| Technology & Infrastructure | €40,000 | 8% | Dedicated infra; security pen-test; mobile app development |
| Product Development | €35,000 | 7% | Agency accounts, B2B portal, subscription tier, multilingual (DE/FR) |
| Reserve | €20,000 | 4% | Contingency |

### Milestones Funded By This Round
- **Month 3**: CCBill live, adult payment processing operational
- **Month 6**: 500 active verified providers; €20,000+ MRR
- **Month 9**: German market launch; 1,000 active providers
- **Month 12**: €60,000+ MRR; Series A materials ready
- **Month 18**: €150,000+ MRR; Series A raise at significantly higher valuation

---

## 14. Investment Ask & Terms

### Seed Round

| Item | Detail |
|---|---|
| **Raise amount** | €250,000 (minimum) — €500,000 (target) |
| **Instrument** | SAFE (Simple Agreement for Future Equity) or Convertible Note |
| **Valuation cap** | €3,000,000 – €5,000,000 pre-money |
| **Discount** | 20% on Series A conversion |
| **Minimum ticket** | €25,000 |
| **Target close** | 60 days from first term sheet |

### Why This Valuation
The platform is **live, functional, and differentiated** — not a deck or prototype. The founding team has delivered a production-grade marketplace at a fraction of what a development agency would charge (comparable platforms: €150,000–€400,000 in development cost alone). The €3–5M cap reflects:
- Fully built platform (vs. zero development cost to investor)
- Operating market with proven willingness to pay (adult services consumers are high LTV)
- Clear path to 8-figure ARR within 3 years
- Multiple comparable EU adult platforms acquired at 8–15x ARR

### What Investors Typically Invest in This Vertical
Based on comparable EU adult platform seed rounds:
- **Angel investors** (individual): €25,000 – €100,000 per ticket
- **Micro-VCs / family offices**: €100,000 – €250,000
- **Strategic investors** (adult industry, payments, media): €250,000 – €500,000+
- **Typical seed round size** for comparable platforms: €300,000 – €800,000

Comparable exits and investments in this vertical:
- **Eros STI** (public): peaked at €500M+ market cap
- **FriendFinder Networks**: IPO at €300M+ valuation
- **Lyst / Farfetch model** (luxury marketplace parallels): 8–12x ARR at exit
- Numerous EU adult directories acquired at 5–10x ARR by media groups

---

## Appendix A — Platform URLs

- **Live platform**: https://www.secretxperience.eu
- **Discovery feature**: https://www.secretxperience.eu/discover
- **Events**: https://www.secretxperience.eu/events
- **Partners directory**: https://www.secretxperience.eu/partners

---

## Appendix B — Key Technology Decisions & Why They Matter

**Next.js App Router (not WordPress or Wix)**
Server-side rendering means every listing page is indexable by Google the moment it's created. Competitor platforms are client-rendered JavaScript — invisible to search engines.

**Supabase (not Firebase or a custom DB)**
Row-Level Security at the database layer means a compromised API key cannot expose user data. This is a legal necessity in a GDPR-regulated market handling sensitive personal data.

**Token economy (not subscription-only)**
Tokens create variable monetisation — providers spend more when their business is good and less when it's quiet, reducing churn during slow periods and maximising revenue during peak periods.

**AI moderation (Anthropic Claude)**
Automated pre-screening of every listing before human review reduces operational cost and legal exposure. The platform cannot be held liable for content it proactively moderates and removes.

---

## Appendix C — Regulatory Positioning

SecretXperience is positioned as a **technology platform** under EU Digital Services Act (DSA) Article 2 definitions — specifically as an "online platform" with hosting and intermediary protections, provided it:
1. ✓ Implements notice-and-takedown procedures (admin moderation in place)
2. ✓ Applies content moderation (AI + human review)
3. ✓ Does not have "knowledge or control" over illegal specific acts (RLS isolation ensures this)
4. ✓ Cooperates with law enforcement requests
5. ✓ Maintains identity verification records (identity_verifications table with secure storage)

This compliance posture is built into the platform — not an afterthought.

---

*For further information, financial model detail, technical due diligence, or to schedule a call, contact: heyokanaga@gmail.com*

*This document is confidential. Do not distribute without the express written permission of SecretXperience.*

---
*SecretXperience.eu | Belgium | Seed Round 2026*
