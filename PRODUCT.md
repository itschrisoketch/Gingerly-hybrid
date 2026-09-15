# Gingerly — Product Context

## Register

**product** — this is app UI. Design serves the work; it is not the product.

The marketing surface lives in a separate repo (`Gingerly-landing`, gingerly.africa).
This repo is the authenticated application: auth flow and role dashboards.

## Users

**Agents** manage relationships with several landlords. Each landlord owns
properties; each property has units; each unit has a tenant. The agent is the
one chasing rent.

**Tenants** pay rent and raise maintenance issues.

Kenyan market: MSISDNs are `2547…`, addresses are Nairobi County, amounts are KES.

### The scene

An agent standing in a stairwell between two Nairobi apartment blocks at 11am,
phone in hand, checking which of forty units have paid this month. The same agent
at a desk at 4pm, reconciling the rest on a laptop.

Both halves are real and roughly equal in weight. That forces a **light theme**
(daylight, outdoors, phone screens) and a layout designed twice rather than a
desktop grid shrunk down.

## Product purpose

Collect recurring rent reliably, and make the exceptions obvious.

The agent's actual job is not admiring a portfolio. It is knowing **who has not
paid** and doing something about it. Every screen should be judged on how fast it
answers that.

## Brand personality

Composed, exact, quietly confident. The voice of someone who has already done the
arithmetic. Serious about money without being severe about it.

Warmth comes from the typography and the photography, not from exclamation marks
or encouragement.

## Anti-references

Confirmed by the product owner. Avoid all three:

- **Celebratory / gamified.** No "Organization Growing Strong", no sparkle icons,
  no congratulatory banners. Rent collection is somebody's housing and somebody's
  income, not a streak counter.
- **Crypto / neon fintech.** No dark grounds with acid accents, no glow, no
  aggressive data-viz. Reads speculative; this product needs to read dependable.
- **Generic SaaS dashboard.** No four-stat-cards-then-a-chart-then-a-table. No
  identical card grids. No hero-metric template.

## Strategic design principles

1. **Exceptions before totals.** Arrears outrank portfolio size. A number nobody
   acts on is decoration.
2. **No invented data.** If the API has not returned it, the UI says so. Never a
   plausible placeholder figure, a fake name, or a hardcoded badge count — those
   are indistinguishable from real data to the person reading them, and this
   product is about money.
3. **Designed at both ends.** Phone and desktop are both primary. Neither is a
   degraded version of the other.
4. **Measured contrast.** Colour pairings are calculated against the 4.5:1 floor,
   not eyeballed. Established practice in this codebase; keep it.
5. **State is never colour alone.** Paid, late and pending carry shape or text as
   well as hue.

## Accessibility

WCAG 2.2 AA. Touch targets ≥44px. Visible focus on everything interactive.
`prefers-reduced-motion` respected. The auth flow already meets this; the
dashboard should not regress from it.
