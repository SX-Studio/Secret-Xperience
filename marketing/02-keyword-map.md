# 02 — Keyword Map

City × category keyword architecture for SecretXperience. Volumes are
**domain-reasoned estimates** (no live tool access this session) — validate with
`/keyword-research`, Ahrefs, or DataForSEO before betting budget. The *structure*
is the durable part; it maps directly to your existing routes.

## How search demand splits in this vertical

1. **Transactional, city-led** — "escort [city]", "escort girls [city]",
   "[city] escorts". Highest intent, highest competition. → city pages.
2. **Country/region** — "escort [country]", "escorts in [country]". → country pages.
3. **Category modifiers** — "independent escort [city]", "VIP companion [city]",
   "erotic massage [city]", "private reception [city]". → category × city.
4. **Language variants** — this is your edge in BE/NL/DE/FR/LU (below).
5. **Informational / AEO** — "is escort advertising legal in [country]", "how to
   verify an escort", "what is private reception". → FAQ + blog + city FAQ.
6. **Advertiser-side** — "advertise as an escort", "free escort advertising",
   "escort directory no commission". → country/advertise pages. *Underserved by
   competitors and high-value (this is who pays you).*

## Priority tiers (where to focus first)

### Tier 1 — primary markets, transactional (build/verify content first)
| Keyword pattern | Example | Maps to |
|---|---|---|
| escort [BE city] | escort brussels, escort antwerp, escort ghent | `/escorts/[city]` |
| escort girls [BE city] | escort girls brussels | `/escorts/[city]` (matches your title tag) |
| escort [country] | escort belgium, escort netherlands | `/escorts/[country]` |
| escort amsterdam / rotterdam | — | `/escorts/[city]` |

### Tier 2 — secondary markets + category modifiers
| Pattern | Example | Maps to |
|---|---|---|
| escort [DE/FR city] | escort berlin, escort paris, escort cologne | `/escorts/[city]` |
| erotic massage [city] | erotic massage antwerp | category × city (expand) |
| private reception [city] | private reception brussels | `/private-reception/[city]` |
| nightlife / club [city] | swingers club antwerp | `/nightlife/[city]` |

### Tier 3 — advertiser acquisition (your revenue side — underserved)
| Pattern | Example | Maps to |
|---|---|---|
| advertise escort [country] | advertise escort belgium | `/escorts/[country]` (already advertiser-focused — good) |
| free escort advertising | — | `/advertise` |
| escort directory no commission | — | `/why-secretxperience` |

### Tier 4 — informational / AEO (see `04-aeo-content-pack.md`)
"is escorting legal in belgium", "how to stay safe meeting an escort",
"what does verified escort mean", "escort etiquette".

## Multilingual edge (your biggest under-exploited opportunity)

Competitors often run English-only or single-language. Your markets are
natively multilingual. High-value local-language terms:

| Market | Language(s) | Example terms |
|---|---|---|
| Belgium (Flanders) | Dutch | escort meisjes, ontvangst thuis, privé ontvangst, erotische massage |
| Belgium (Wallonia) | French | escorte belgique, fille de joie, salon de massage |
| Netherlands | Dutch | escort dames, privé ontvangst, thuisontvangst, sexadvertenties |
| Germany | German | begleitservice, escort damen, hausbesuche, erotische massage |
| France | French | escorte paris, accompagnatrice, salon de massage |
| Luxembourg | FR/DE | escorte luxembourg, begleitservice luxemburg |

**Action:** add `hreflang` and local-language headings/intro variants to city
pages for their dominant language. Even just localizing the H1 + intro + FAQ in
the city's primary language is a large, low-competition win. (The `cityContent.ts`
module shipped this session is structured so localized intros can be added per
city without touching the page template.)

## Content-gap themes competitors typically miss

- **Trust/safety content** — you already have the pages; turn them into ranking
  assets ("how SecretXperience verifies advertisers").
- **"No commission / free to advertise"** — strong advertiser-side hook.
- **City guides framed for visitors** — discreet, useful, links into city pages.
- **AEO answers** — almost nobody is writing for ChatGPT/Perplexity here yet.

## Next step
Run `/keyword-research` (your installed skill) or a live tool to attach real
volumes and difficulty, then sort Tier 1–2 by volume ÷ difficulty to sequence
which city/category pages to enrich first.
