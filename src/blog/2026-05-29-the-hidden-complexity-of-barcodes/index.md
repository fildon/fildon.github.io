---
title: The Hidden Complexity of Barcodes
description: How the global barcode system actually works, from GS1 prefixes to check digits to the coming transition to QR codes
date: 2026-05-29
layout: layouts/post.njk
---

## What is a barcode encoding?

The black and white stripes are an optical encoding of a decimal number. A scanner reads the pattern of bars and recovers the digits.

For retail products, the dominant formats are UPC-A (12 digits, common in the US) and EAN-13 (13 digits, common everywhere else). Every product you buy in a supermarket has one of these.

## A brief history

A corner shop with a few hundred products can function with a cashier who knows the prices. A suburban supermarket in 1970 might stock 10,000 SKUs and serve hundreds of customers a day. At that scale, manual price-keying at checkout wasn't just slow — the error rate across millions of daily transactions became a real cost.

The inventory side was arguably more significant. Without item-level sales data, replenishment relied on periodic physical counts and buyer intuition. The barcode promised to turn the checkout lane into a data collection point: every sale automatically recorded, stock levels updated in real time.

The timing was right. IBM had been building mainframes for large retailers through the 1960s, so the back-end infrastructure existed in prototype form. The missing piece was a reliable way to get an identifier off a tin of beans and into a database without a human in the loop.

In 1970, US grocery trade associations formed the Ad Hoc Committee on a Uniform Grocery Product Code — a voluntary industry body with no regulatory authority — and invited technology companies to submit proposals.

After evaluating submissions from IBM, RCA, Litton and others, they chose the IBM proposal, designed primarily by [George Laurer](https://www.ibm.com/history/george-laurer), in 1973. This became UPC. [The first product ever scanned](https://www.history.com/this-day-in-history/june-26/barcode-scanner-invention-first-use) was a pack of Wrigley's chewing gum, at a Marsh supermarket in Troy, Ohio, on 26 June 1974.

RCA had pushed a competing [bull's-eye circular barcode](https://www.ibm.com/history/upc) that could be scanned from any angle. It lost out partly because it was harder to print reliably on packaging of the era.

In the US, UPC was administered by the Uniform Code Council. Europe responded with EAN in 1976, administered by the International Article Numbering Association. The two organisations coexisted for decades.

## UPC-A and EAN-13

When EAN was designed in Europe in 1976, there was already a large installed base of US UPC scanners. The designers needed EAN to be backward compatible.

Their solution: [EAN-13 is a 13-digit superset of the 12-digit UPC-A](https://en.wikipedia.org/wiki/International_Article_Number), with one extra leading digit. European codes use non-zero values for that digit — the Netherlands prefix `870`, for instance, starts with `8`. For US products, the leading digit is `0`, which means a UPC-A code becomes a valid EAN-13 simply by prepending a `0`. An EAN scanner seeing a code that starts with `0` can drop that digit and treat the remaining 12 as UPC-A — the mapping is bijective.

This meant European scanners could read American barcodes from day one.

## GS1

In 2005, the two organisations [merged to form GS1](https://en.wikipedia.org/wiki/GS1), a non-profit that now serves as the global authority. The system works hierarchically:

- GS1 allocates 3-digit prefixes to national member organisations (GS1 UK, GS1 Netherlands, etc.)
- Each national body allocates company prefixes to businesses that pay to join
- Each company then assigns the remaining digits to their own products

So an EAN-13 code like `0 01234 56789 X` breaks down roughly as:

- `001` → GS1 US prefix (starting with `0`, as established above)
- `234` → company prefix (assigned to a specific business)
- `5678` → product reference (assigned by that company)
- `X` → check digit

This federated design means no central body needs to know every product in the world. They just carve up the number space and delegate.

## Prefix allocation

[GS1 prefixes](https://en.wikipedia.org/wiki/List_of_GS1_country_codes) are 3 digits, ranging from 000 to 999, giving 1,000 possible values. Not all are assigned — large portions are reserved for future use. In practice there are around 120 active member organisations.

The US alone occupies a huge chunk: 000–139. The Netherlands gets 870–879, a block of 10 prefixes. Smaller countries often get just one or two.

## The structure within a prefix

Once you're past the 3-digit GS1 prefix, the remaining 9 digits (before the check digit) are split between a [company prefix and a product reference](https://www.gs1.org/standards/id-keys/company-prefix). Crucially, this split is not fixed.

GS1 allocates company prefixes of varying lengths depending on how many products you need:

| Company prefix length | Product reference digits | Max distinct products |
| --------------------- | ------------------------ | --------------------- |
| 7 digits              | 5 digits                 | 100,000               |
| 8 digits              | 4 digits                 | 10,000                |
| 9 digits              | 3 digits                 | 1,000                 |
| 10 digits             | 2 digits                 | 100                   |
| 11 digits             | 1 digit                  | 10                    |

Larger companies with more products get shorter prefixes, leaving more room for product references. Smaller companies get longer prefixes and can identify fewer products.

The 12-digit code space gives 10¹² = 1 trillion possible identifiers. That sounds like a lot, but every digit is decimal — 0–9 only, no hex, no alphanumeric encoding — which makes the space around 4,700 times smaller than it would be with base-36 characters. The constraint was baked in during the early 1970s, when systems needed to be operable by humans reading and typing numbers.

## The check digit

The final digit is a checksum [mathematically derived from the preceding ones](https://www.activebarcode.com/codes/checkdigit/modulo10) — alternating multiply-by-1 and multiply-by-3, sum the results, modulo 10. This catches most scanning errors and accidental transpositions. A misread digit almost always produces an invalid check digit.

## Collisions

In theory, the namespace partitioning guarantees uniqueness — if everyone follows the rules. In practice, a few things go wrong:

**Fraud** — counterfeit goods sometimes copy a legitimate barcode from a real product.

**Recycling** — GTINs (the formal term for barcode numbers) were historically permitted for reuse after a 48-month window. [GS1 prohibited reuse entirely in 2019](https://www.gs1uk.org/insights/news/from-january-2019-gtins-should-never-be-reused-again), but old assignments still circulate in legacy systems.

**Unofficial barcodes** — small sellers sometimes generate barcodes without a GS1 prefix, using randomly chosen numbers that may clash with real products.

**In-store barcodes** — [codes starting with `2`](https://en.wikipedia.org/wiki/List_of_GS1_country_codes) are explicitly designated for internal store use (loose produce, deli counter items). These are not globally unique and only mean something within that store's system.

## Shortcomings

**No GTIN history** — GS1's registries reflect current assignments only. Historical data exists only as a byproduct of services that happened to cache it — crowd-sourced databases like Open Food Facts, web archives, commercial lookup tools. No one designed a system to track reassignment history; the assumption was that reassignment would be rare enough not to matter.

**Prefix exhaustion** — If a company exhausts its product reference space, it can't get its prefix shortened — that would renumber all existing products, cascading through every retailer and system that holds those GTINs. So they acquire a second prefix and assign new products from there.

**Mergers** — Two companies bring two prefixes. There's no clean way to consolidate, because renumbering would require updating every downstream system. Merged companies typically carry both prefixes indefinitely, which is why products from the same brand sometimes look like they come from different companies.

**Corporate identity coupled to product identity** — the constraint underlying all of this. The GTIN system ties product identification to corporate structure, which causes pain whenever corporate structures change — and they change constantly.

## Digital Link

The 1D barcode is showing its age. It encodes only the GTIN. Modern supply chains also want to encode expiry dates, batch numbers, serial numbers, and sustainability data on the same label. Right now that typically means printing multiple barcodes on the same packaging.

GS1's answer is [Digital Link](https://www.gs1.org/standards/gs1-digital-link) — a QR code that encodes a URL, pointing to a rich product data page. The URL structure embeds the GTIN, so existing systems can still extract the product identifier, but the code can carry much more.

GS1 has been pushing a target called [Sunrise 2027](https://www.gs1us.org/industries-and-insights/by-topic/sunrise-2027): by that point, major retailers' point-of-sale systems should be capable of scanning 2D codes at checkout. [Walmart, Carrefour and others](https://www.gs1.org/sites/gs1/files/2024-06/global-industry-endorsement-statement-qr-codes-with-gs1-standards.pdf) are publicly committed to this.

The transition strategy for suppliers is straightforward: print both. Legacy 1D barcode for scanners that aren't yet 2D-capable, Digital Link QR code alongside it for those that are. Suppliers can adopt now without waiting for universal retailer readiness.

The 1D barcode won't disappear in 2027. Vending machines, self-checkout kiosks, and embedded scanners in smaller retailers have long replacement cycles. The magnetic stripe on payment cards was superseded by the chip in the 1990s and lingered for decades. Expect something similar here.

Take care,

Rupert
