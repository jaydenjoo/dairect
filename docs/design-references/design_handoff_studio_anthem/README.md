# Handoff: dairect.kr Redesign — "The Studio Anthem"

**Target repo:** `github.com/jaydenjoo/dairect`  
**Suggested branch:** `feat/redesign-studio-anthem`  
**Target stack:** Next.js 16.2 (App Router) · Tailwind CSS 4 · Framer Motion · TypeScript

---

## 1. Overview

This bundle contains the **final, validated design for dairect.kr** — a founder-led studio that sells **direction × execution** (human direction + AI execution).

The design is codified as **"The Studio Anthem"** — a Warm Brutalism editorial language with three layered systems:

1. **Base design system** — Amber + Charcoal + Cream palette, Fraunces/Geist/Pretendard type trio, 1px hairlines, 4px hard shadows, asymmetric 12-col grid.
2. **Brand identity layer** (`CLAUDE.md`) — D + AI + RECT etymology, amber-dot logo rules, Korean/English bilingual slogans, dual-axis typography mapping.
3. **Accessibility + performance overlays** — WCAG 2.2 AA, `prefers-reduced-motion`, font-metric fallbacks, `@font-face size-adjust`.

**Validation status:** 7-axis validation passed, zero warnings. Production-ready.

---

## 2. About the Design Files

The HTML files bundled here are **design references, not production code.**  
They are high-fidelity prototypes showing exact colors, typography, spacing, layouts, interactions, and copy. **Your task is to recreate them in Next.js + Tailwind 4 using the patterns in this README** — do not copy the HTML directly.

Why not ship the HTML?

- HTML was authored with vanilla `<style>` + IntersectionObserver + hand-rolled JS.
- Target stack needs: SSR/RSC, `next/font` (FOIT-free), Framer Motion, component boundaries, image optimization, route-level code splitting.
- Brand tokens must live in Tailwind 4's `@theme` so all components share them, not duplicated CSS.

---

## 3. Fidelity

**HIGH-FIDELITY.** All values are final:

- Every hex code is exact. Do not approximate.
- Every font-family / weight / letter-spacing / line-height is deliberate.
- Every shadow is `Npx Npx 0 0 var(--signal)` (sharp, offset — never soft/blur).
- Copy (Korean + English) is finalized. Do not rewrite without founder approval.

---

## 4. Files Included

```
design_handoff_studio_anthem/
├── README.md                        ← you are here
├── CLAUDE.md                        ← brand rules (carry forward into repo)
├── VALIDATION-REPORT.md             ← 7-axis audit, for QA reference
│
├── references/                      ← HTML design references
│   ├── Landing-A-Light.html         ← PRIMARY: cream bg, editorial
│   ├── Landing-B-Dark.html          ← variant: ink bg, cinematic
│   ├── Landing-C-Rhythm.html        ← variant: section-inverted rhythm
│   ├── Landing-D-Auto.html          ← variant: time-of-day auto theme
│   ├── Projects.html                ← /projects index + 3 case studies
│   ├── About.html                   ← /about founder + philosophy
│   ├── Hero.html                    ← Hero iteration (reference only)
│   └── *.css                        ← source CSS (token reference only)
│
├── tokens/
│   └── theme.css                    ← copy-paste into app/globals.css
│
├── config/
│   ├── tailwind.config.ts           ← Tailwind 4 @theme block
│   └── next.config.ts               ← Next 16.2 optimizations
│
└── snippets/
    ├── fonts.ts                     ← next/font/google loaders
    ├── motion.ts                    ← Framer Motion reusable variants/hooks
    └── WordmarkLogo.tsx             ← logo component (Rule 1/2/3)
```

---

## 5. Recommended Next.js 16.2 Folder Tree

```
app/
├── layout.tsx                       ← root: fonts, theme class, <Nav/>, <Footer/>
├── globals.css                      ← Tailwind directives + @theme + @font-face fallbacks
├── page.tsx                         ← "/"  → <LandingA />
│
├── (variants)/                      ← route group for A/B variants
│   ├── light/page.tsx               ← duplicates page.tsx for comparison
│   ├── dark/page.tsx                ← <LandingB />
│   ├── rhythm/page.tsx              ← <LandingC />
│   └── auto/page.tsx                ← <LandingD />
│
├── projects/
│   ├── page.tsx                     ← index + filter tabs
│   ├── [slug]/page.tsx              ← dynamic case study template
│   └── _data/projects.ts            ← typed project manifest
│
├── about/
│   └── page.tsx                     ← founder + timeline + philosophy
│
└── api/
    └── contact/route.ts             ← Start-a-project CTA endpoint
│
components/
├── chrome/
│   ├── Nav.tsx                      ← fixed top, .scrolled state
│   ├── Footer.tsx                   ← slogan + large wordmark
│   └── WordmarkLogo.tsx             ← D/AI/RECT split, Rules 1/2/3
│
├── hero/
│   ├── Hero.tsx                     ← asymmetric 6fr/6fr grid
│   ├── HeroHeadline.tsx             ← letter-by-letter reveal
│   ├── HeroFrameStack.tsx           ← 3 diagonal frames (Chatsio/Findably/AutoVox)
│   └── HeroTrustRow.tsx             ← 3-cell metric row
│
├── sections/
│   ├── Etymology.tsx                ← D . AI . RECT split (Rule 3)
│   ├── Manifesto.tsx                ← direction × execution bilingual
│   ├── Services.tsx                 ← 4 steps with DIRECTED/EXECUTED tags
│   ├── Proof.tsx                    ← 3 case cards w/ outcome metrics
│   ├── Pricing.tsx                  ← 3-card asymmetric (middle featured)
│   ├── Founder.tsx                  ← quote + avatar frame
│   └── FinalCTA.tsx                 ← ink bg, large serif italic
│
├── projects/
│   ├── ProjectIndex.tsx             ← 10-row list with cursor-follow thumbnail
│   ├── FilterTabs.tsx               ← client component (filters by category)
│   ├── CaseStudyCover.tsx
│   ├── CaseStudyChapters.tsx        ← 01·02·03·04
│   └── CaseStudyOutcome.tsx
│
├── about/
│   ├── Timeline.tsx                 ← horizontal scroll, 6-month density
│   ├── Philosophy.tsx               ← 3 "manuscript-in-progress" cards
│   └── ProcessDiagram.tsx           ← circle/square/arrow line art
│
├── primitives/
│   ├── Button.tsx                   ← variants: primary, ghost, cta-mini
│   ├── Kicker.tsx                   ← mono uppercase label
│   ├── SerifDisplay.tsx             ← Fraunces display with italic slots
│   └── Hairline.tsx                 ← 1px divider
│
└── motion/
    ├── Reveal.tsx                   ← scroll-triggered fade/translate
    ├── MaskReveal.tsx               ← clip-path reveal
    ├── MagneticCTA.tsx              ← pointer-tracking button wrapper
    └── LetterReveal.tsx             ← staggered per-letter headline
│
lib/
├── fonts.ts                         ← next/font loaders
├── motion-config.ts                 ← easings, durations, shared variants
└── reduced-motion.ts                ← useReducedMotion wrapper
│
content/
├── projects.ts                      ← typed data (10 projects)
├── case-studies/
│   ├── chatsio.ts
│   ├── findably.ts
│   └── autovox.ts
└── copy.ts                          ← centralized KR/EN strings
│
public/
├── favicon.svg
├── og-image.png
└── placeholders/                    ← temp imagery until real photos arrive
```

---

## 6. Design Tokens

### 6.1 Colors (exact)

| Token | Hex | Role |
|---|---|---|
| `--canvas` | `#F5F1E8` | Warm ivory — primary light bg |
| `--paper`  | `#FAF7F0` | Slightly brighter paper — nav bg |
| `--ink`    | `#141414` | Charcoal — primary text & dark bg |
| `--smoke`  | `#1F1F1F` | Soft charcoal — dark section alt |
| `--signal` | `#FFB800` | Amber — the ONLY accent |
| `--dust`   | `#8B8680` | Warm gray — meta text |
| `--rust`   | `#C85A3B` | Deep orange — used sparingly, never as CTA |

**Hairlines:**
- `--hairline-canvas: rgba(20,20,20,0.12)` — 1px on light bg
- `--hairline-canvas-strong: rgba(20,20,20,0.2)`
- `--hairline-ink: rgba(245,241,232,0.12)` — 1px on ink bg
- `--hairline-ink-strong: rgba(245,241,232,0.22)`

**Forbidden:** indigo, violet, purple, blue, teal, any gradient except film-grain noise overlay.

### 6.2 Typography

| Family | Weights | Use |
|---|---|---|
| **Fraunces** (serif, Google) | 300, 400, 500, 600 + italic | Display headlines, "direction" word, editorial subheads |
| **Geist** (sans, Vercel) | 300, 400, 500, 600 | UI, body EN, buttons |
| **Geist Mono** | 400, 500 | Kickers, labels, metrics, "execution" word, code |
| **Pretendard** (KR) | 400, 500, 600, 700, 900 | All Korean copy |

**Headline letter-spacing:**  
- Fraunces display: `-0.02em`
- Korean (Pretendard 900): `-0.025em`
- Mono kickers: `+0.12em`, uppercase
- **Never uppercase Korean.**

### 6.3 Spacing & Layout

- **Section padding:** `clamp(96px, 12vw, 160px) 48px`
- **Container max-width:** `1200px` (prose) / `1440px` (hero)
- **Grid:** 12-col asymmetric (e.g. hero is `6fr 6fr`, services are `5fr 7fr`, project rows are `1fr 3fr 4fr 2fr`)
- **Border radius:** `2px` (buttons/CTAs) · `0` (cards/frames) — **no pills, no glassmorphism.**
- **Shadow:** always sharp `Npx Npx 0 0 var(--signal)` on hover — never `blur()`, never soft.

### 6.4 Motion

**Easings:**  
- `spring-soft`: `cubic-bezier(.2,.9,.2,1)` (default)
- `reveal-mask`: `cubic-bezier(.6,.02,.2,1)`

**Durations:**  
- Micro (hover, color): 180ms
- Reveal (fade/translate): 620–720ms
- Mask reveal: 900ms
- Cursor spring lag: 180ms

All motion respects `prefers-reduced-motion: reduce` → instant fade only.

---

## 7. Brand Identity Layer (CRITICAL — see CLAUDE.md)

The wordmark "dairect" encodes three words: **D**irector + **AI** + **RECT** (direct).

### Logo Rules (enforce via `<WordmarkLogo variant="..." />`)

1. **Default (body / nav / small):** `dairect` single color + `.` in amber
2. **Emphasis (hero / footer large):** `d` + `rect` in base color, **`ai` in amber**
3. **Etymology (decomposed):** `D . AI . RECT` with mono labels below (`DIRECTOR` / `ARTIFICIAL INTELLIGENCE` / `DIRECT`)

### Slogan (non-negotiable)

- **KR:** `코드는 AI가, 방향은 내가.`
- **EN:** `Code by machines. Direction by us.`

**Footer: both languages required. Hero: never use this directly (main headline is different copy).**

### Dual-Axis Type Mixing

When `direction` and `execution` appear in copy, mix fonts inline:
- `direction` → `font-serif italic` (+ amber on emphasis)
- `execution` → `font-mono`

### Persona

`Vibe Architect` — **About page only**. Forbidden on landing hero/CTA/nav.

---

## 8. Tailwind CSS 4 Configuration

See `config/tailwind.config.ts` and `tokens/theme.css`. Copy `theme.css` contents into `app/globals.css`.

Tailwind 4 uses `@theme` inline in CSS. Example usage:
```tsx
<h1 className="font-serif text-[clamp(48px,6vw,96px)] tracking-tight-2 text-ink">
  <em className="italic font-light text-signal">Direction</em> is the product.
</h1>
```

---

## 9. Font Loading (next/font/google)

See `snippets/fonts.ts`. Uses `next/font/google` for Fraunces + Geist + Geist Mono (Geist is actually `next/font/local` from the Vercel font package, or `geist` npm package). Pretendard via CDN (its Google Fonts mirror is incomplete). All with `display: 'swap'` and metric-matched CSS `adjustFontFallback` for near-zero CLS.

---

## 10. Framer Motion

See `snippets/motion.ts`. Install:
```bash
pnpm add framer-motion
```

Provides:
- `useReveal()` — scroll-triggered IntersectionObserver hook
- `letterStagger` variants — for hero headline
- `maskReveal` variants — clip-path reveal
- `magneticCta(ref, strength)` — pointer-tracking transform
- `filmStripFloat` — 3-frame diagonal hover parallax

All variants guarded by `useReducedMotion()`.

---

## 11. Performance Checklist

### Required (ship blockers)
- [ ] Lighthouse Performance ≥ 92 (mobile), 98 (desktop)
- [ ] LCP ≤ 1.8s (mobile 4G throttled)
- [ ] CLS ≤ 0.02 (enforced by next/font + size-adjust fallbacks)
- [ ] TBT ≤ 150ms
- [ ] `next/image` with `priority` on hero frames only
- [ ] All case-study imagery: AVIF primary, WebP fallback
- [ ] No layout shift from font swap (metric-matched fallback verified in DevTools)

### Recommended
- [ ] Route-level code splitting — each variant landing in its own route group
- [ ] Framer Motion lazy-loaded for below-fold sections (`const Reveal = dynamic(() => import('...'), {ssr: false})` where safe)
- [ ] Static generation for `/`, `/projects`, `/about`, `/projects/[slug]`
- [ ] `revalidate: 3600` on case study pages
- [ ] Prefetch `<Link>` default on
- [ ] Film-grain SVG inlined as data URL (already in reference CSS)
- [ ] Preload LCP image: `<link rel="preload" as="image" href="/hero-frame-01.avif">`

### Accessibility (verified in design)
- [ ] All amber-on-ink/canvas pairs meet WCAG 2.2 AA (design already validated)
- [ ] `prefers-reduced-motion` reduces all motion to fade-only
- [ ] Focus-visible: 2px amber outline, offset 3px
- [ ] All form fields have explicit `<label htmlFor>`
- [ ] Nav keyboard-traversable
- [ ] Korean text: `word-break: keep-all` + `overflow-wrap: break-word`

### SEO
- [ ] Per-route `generateMetadata` with OG image
- [ ] JSON-LD: `Organization` + `Person` (Jayden) + `CreativeWork` per project
- [ ] `sitemap.ts` exports all routes
- [ ] `robots.ts` allows production, blocks preview
- [ ] `hreflang="ko"` + `hreflang="en"` where bilingual

---

## 12. Git Workflow

```bash
# 1. Clone & branch
git clone git@github.com:jaydenjoo/dairect.git
cd dairect
git checkout -b feat/redesign-studio-anthem

# 2. Scaffold (if empty repo)
pnpm create next-app@latest . --typescript --tailwind --app --use-pnpm

# 3. Install deps
pnpm add framer-motion geist
pnpm add -D @types/node

# 4. Drop in handoff files
#    - Copy tokens/theme.css into app/globals.css
#    - Copy snippets/ into lib/ and components/
#    - Copy CLAUDE.md to repo root

# 5. Implement section by section (recommended order)
#    1. chrome/Nav + chrome/Footer + WordmarkLogo
#    2. primitives/ (Button, Kicker, SerifDisplay, Hairline)
#    3. motion/ (Reveal, LetterReveal, MaskReveal)
#    4. hero/ → verify Landing-A-Light.html parity
#    5. sections/ in order (Etymology, Manifesto, Services, Proof, Pricing, Founder, FinalCTA)
#    6. /projects route
#    7. /about route
#    8. variants (B/C/D) — thin wrappers over the same components

# 6. Commit cadence
#    - One PR per route for reviewability
#    - Squash-merge with imperative messages ("Hero: land asymmetric 6/6 grid")

# 7. Pre-merge checklist
#    - `pnpm build` passes
#    - Lighthouse CI green
#    - Visual regression vs reference HTML (Percy or manual)
```

---

## 13. Screens at a Glance

| Route | Reference | Key Components |
|---|---|---|
| `/` | `Landing-A-Light.html` | Hero → Etymology → Manifesto → Services → Proof → Pricing → Founder → FinalCTA → Footer |
| `/` (dark) | `Landing-B-Dark.html` | Same structure, `.section-dark` everywhere, ink-first palette |
| `/` (rhythm) | `Landing-C-Rhythm.html` | Alternating light/ink sections for rhythm |
| `/` (auto) | `Landing-D-Auto.html` | Time-of-day auto theme via `prefers-color-scheme` + JS |
| `/projects` | `Projects.html` | Hero → FilterTabs → ProjectIndex (10 rows) → 3 Featured Case Studies → CTA |
| `/about` | `About.html` | Hero (50/50) → Timeline (horizontal scroll) → Philosophy (3 cards) → ProcessDiagram → CTA |

---

## 14. Asset Notes

- **No real imagery yet.** All frames are CSS-drawn placeholders (gradient + kicker labels). Replace with actual project screenshots before launch.
- **No custom icons.** Arrow glyphs are Unicode (`→`, `↗`). Any future icons should be stroke-only, 1px, sharp corners — no filled, no rounded.
- **Film grain** is an inline SVG data URL at `body::before` (4% opacity). Preserve it — it's a signature of the Studio Anthem.

---

## 15. Contact

Questions on design intent → `@jaydenjoo` (founder, also designer of record).  
Questions on brand rules → see `CLAUDE.md` first, then ask.

**Good luck. Ship with restraint.**
