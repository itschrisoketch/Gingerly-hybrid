# Gingerly — Design System

Derived from the shipped code. `app/globals.css` is the source of truth for
tokens; this file explains intent and the rules that are not visible in the
variable names.

## Theme

**Light, with dark supported.** Chosen from the scene in PRODUCT.md: an agent
outdoors in daylight on a phone. Dark is available and must stay legible, but
light is the design target.

## Color strategy

**Restrained.** Tinted neutrals plus one accent held to roughly 10% of the
surface. This is the product-register default, and it is also what keeps the
result clear of both the neon-fintech and generic-SaaS anti-references.

### Roles

| Role | Token | Value | Use |
|---|---|---|---|
| Accent / action | `--accent` | `hsl(185 81% 29%)` = `#0E7C86` | Every primary action, active nav, selected state |
| Ink / surface | `--navy-500` | `hsl(209 71% 15%)` | Text, and constant branded surfaces such as the auth panel |
| Ground | `--background` | `hsl(0 0% 98%)` | Page |
| Muted ground | `--muted` | `hsl(210 20% 96%)` | Recessed fields, rails, secondary surfaces |
| Positive | `--success` | `hsl(142 76% 36%)` | Paid |
| Warning | `--warning` | `hsl(25 95% 53%)` | Due soon |
| Negative | `--destructive` | `hsl(0 84% 60%)` | Late, errors |

Semantic status colour is separate from the accent and does not count against the
10%.

**Teal is the primary action colour, not navy.** `--primary` is still navy
because `globals.css` also drives `h1 { color }` from it; that flip is pending and
belongs with the wider dashboard work. Until then, actions take their colour from
`--accent` explicitly.

### Rules

- Never `#000` or `#fff` as text or ground. Use the tokens.
- `--navy-*` and `--teal-*` are **not** redefined in `.dark`. They are
  theme-invariant, so they are safe for constant branded surfaces and wrong for
  text. Text uses `--foreground`; actions use `--accent`.
- Contrast is calculated, not judged. 4.5:1 minimum for text, 3:1 for
  non-text indicators.

## Typography

| Role | Face | Token | Notes |
|---|---|---|---|
| Body | Poppins | `--font-body` | Geometric sans; carries UI text. Weights 300/400/500/600/700 loaded explicitly — Poppins is not variable |
| Display | Instrument Serif | `--font-display` | 400 only, normal + italic; where the brand's character lives |
| Legacy | Jost | `--font-sans` | Still the global default; being retired |

Note this no longer matches gingerly.africa, which uses Inter Tight. That
continuity was the original goal of the auth work; the product owner chose
Poppins app-wide on 2026-09-17 with the divergence stated. If the landing site
moves to Poppins too, the two are back in step.

**The brand face is opt-in via `data-brand-font`.** `globals.css` sets an explicit
`font-family: var(--font-sans)` on `h1`-`h6`, `p`, `a`, `span`, `div`, `input` and
`button` inside `@layer base`. A class on a wrapper cannot override that. Only a
subtree carrying `data-brand-font` renders in Poppins. Currently: the auth
shell and the dashboard shell.

Instrument Serif is used sparingly and deliberately — a single accent word in a
heading, or a pull quote. It is not a UI face.

Headline treatment is shared and exported from `components/auth/auth-heading.tsx`
(`HEADLINE_CLASS`, `HEADLINE_ACCENT_CLASS`) so the places that use it cannot drift.

## Geometry

- Radius: `--radius` is `0.75rem`. Fields, buttons and the role toggle are
  `rounded-xl`; panels `rounded-2xl`.
- Control height: **48px** for fields and primary buttons. The inner control of a
  segmented toggle stays at **44px**, the touch-target floor, with the track
  padding making up the difference.
- Sidebar rail 68px collapsed, 252px expanded.

## Components

- **Fields** — `components/auth/auth-input.tsx`. A container with a borderless
  input inside, so adornments sit *in* the field. Recessed muted fill at rest,
  lifting to the page ground on focus with a low-opacity teal halo. Invalid state
  keys off `aria-invalid`, so visual and accessible state cannot drift.
- **Buttons** — `components/auth/auth-button-styles.ts`. Primary is teal; "back"
  actions stay outline so a step backwards does not carry the weight of the
  forward action.
- **Icons** — Material Symbols, `-outline-rounded`, via `components/ui/icon.tsx`.
  Bundled offline; no runtime request. Names are validated by `pnpm verify:icons`.
  `h-5 w-5` standard, `h-4 w-4` small.
- **Logo** — `components/wordmark.tsx`. A CSS mask filled with `currentColor`, so
  one white-on-transparent asset serves light and dark surfaces. `markOnly` crops
  to the diamond for narrow contexts.

## Motion

Restrained. Tween, `cubic-bezier(0.22, 1, 0.36, 1)`, 150–280ms. No bounce, no
elastic. Never animate layout properties other than a deliberate width transition
on the nav rail.

Everything respects `prefers-reduced-motion`, via `useReducedMotion` for
framer-motion and a global CSS guard for the rest.

## Banned

Carried from the anti-references, and all previously present in this codebase:

- Gradient text (`.gradient-text`) and gradient grounds
- Glassmorphism (`.glass`, `.glass-card`)
- Side-stripe accent borders (`border-l-4` as decoration)
- Sparkle icons and celebratory banners
- Hardcoded sample data presented as real — names, counts, badge numbers
- Identical card grids; the hero-metric template

`.glass` and `.gradient-text` still exist in `globals.css` and are still used by
unmigrated dashboard pages. They are being removed page by page, not kept.
