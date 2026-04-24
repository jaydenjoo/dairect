# Design System Strategy: The Intelligent Sanctuary

> ⛔ **폐기됨 (2026-04-24)**
>
> 본 디자인 시스템("The Intelligent Sanctuary" — Indigo + DM Sans)은
> Studio Anthem(Amber + Fraunces/Geist) 전환으로 대체되었습니다.
>
> **현행 브랜드 규칙**: [`redesign-2026-studio-anthem/BRAND.md`](../redesign-2026-studio-anthem/BRAND.md)
> **번들 원본**: [`design_handoff_studio_anthem/`](../design_handoff_studio_anthem/)
> **마이그레이션 맵**: [`redesign-2026-studio-anthem/MIGRATION-MAP.md`](../redesign-2026-studio-anthem/MIGRATION-MAP.md)
>
> 이 문서는 참조용 히스토리로만 보존합니다 (Epic 7에서 `docs/archived/`로 이동 예정).

---


## 1. Overview & Creative North Star
The creative North Star for this design system is **"The Guided Sanctuary."** In an era of chaotic, high-density AI tools, this system positions 'dairect' as a calm, architectural space for code direction. It rejects the "dashboard" aesthetic in favor of a **High-End Editorial** experience. 

We break the standard SaaS "template" look by using **intentional asymmetry within Bento Grid structures**, high-contrast typography scales, and a philosophy of **Tonal Layering**. The goal is to make the user feel mentored, not managed. Every element should feel like it was placed with intent, surrounded by generous whitespace that allows the developer's mind to breathe.

---

## 2. Colors: Tonal Architecture
We move beyond flat hex codes to a system of functional roles. We rely on the warmth of the `#4F46E5` (Indigo) to provide authority, while the neutral palette remains soft (`#FAFAF8`) to prevent eye fatigue.

### The Foundation
- **Primary (`#3525CD` / `#4F46E5`):** Used for direction and focus. Use `primary_container` for soft emphasis.
- **Surface & Background (`#F9F9F7`):** The primary canvas. It is intentionally off-white to feel like premium paper rather than a cold screen.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions. 
- *Instead of a border:* Place a `surface_container_low` section directly onto the `background`. The 2-3% shift in luminance is sufficient to define the boundary without creating visual noise.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers:
1.  **Level 0 (Base):** `surface` - The global background.
2.  **Level 1 (Sectioning):** `surface_container_low` - For large bento blocks or sidebar foundations.
3.  **Level 2 (Interaction):** `surface_container_lowest` (Pure White) - For active cards, input fields, and elevated content.

### Signature Textures & Glassmorphism
- **The "Glass" Rule:** Navigation and floating overlays must use `surface_container_lowest` at 70% opacity with a `24px` backdrop blur. This allows the "warm indigo" of the brand to bleed through softly, grounding the UI.
- **Soul Gradients:** Use a subtle linear gradient (Top-Left: `primary` to Bottom-Right: `primary_container`) for main CTAs. This creates a tactile, convex feel that flat colors cannot replicate.

---

## 3. Typography: The Editorial Voice
Our typography mimics high-end technical journals. It is precise (JetBrains Mono) yet human (DM Sans/Pretendard).

- **Display & Headlines:** Use **DM Sans** (English) and **Pretendard** (Korean). 
    - *Constraint:* Korean headlines must be **20-30% smaller** than English counterparts to maintain visual weight parity.
    - *Constraint:* Absolutely NO uppercase for Korean text. NO wide letter-spacing.
- **Body Text:** **Pretendard Variable**. Use a generous `1.8` line-height and `word-break: keep-all` for Korean to ensure clean, block-like text wrapping.
- **Code:** **JetBrains Mono**. This is our "technical anchor." It should always be set against a `surface_container_highest` background to signify a different functional zone.

---

## 4. Elevation & Depth: Tonal Layering
We do not use structural lines. We use light.

- **The Layering Principle:** Depth is achieved by "stacking" surface tiers. A `surface_container_lowest` card sitting on a `surface_container_low` background creates a natural, soft lift.
- **Ambient Shadows:** For floating elements, use multi-layer shadows. 
    - *Layer 1:* `0px 2px 4px rgba(17, 24, 39, 0.04)`
    - *Layer 2:* `0px 12px 32px rgba(17, 24, 39, 0.08)`
    - Shadow colors must be tinted with the `on_surface` color (Gray-900) to feel like natural ambient light.
- **The "Ghost Border":** If accessibility requires a stroke, use `outline_variant` at **15% opacity**. High-contrast borders are forbidden.

---

## 5. Components: Functional Elegance

### Buttons & CTAs
- **Primary:** `primary` background with `on_primary` (white) text. 12px (`lg`) rounded corners. States should transition via a slight luminosity increase on hover, never a color shift.
- **Ghost:** Transparent background with `gray-700` text. On hover, apply a `surface_container_high` background.

### Bento Cards
- **Radius:** Fixed `12px` (`lg`).
- **Layout:** Use varying aspect ratios (1:1, 2:1, 1:2) within the Bento grid.
- **Content:** Forbid divider lines within cards. Use `1.5rem` (`xl`) spacing between internal elements to denote hierarchy.

### Input Fields
- **Styling:** `surface_container_lowest` background with a `1px` Ghost Border (`outline_variant` @ 20%). 
- **Focus State:** Transition the Ghost Border to `primary` @ 100% and add a soft `4px` primary-colored glow (shadow).

### Code Blocks
- Use `gray-900` background for high-contrast "Focus Mode" code areas, or `surface_container_highest` for "Inline" code.
- Always use `JetBrains Mono` at `0.875rem` (`body-md`) for maximum readability.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical Bento layouts to highlight key AI directions.
- **Do** prioritize "Keep-all" for Korean text to maintain a tidy editorial look.
- **Do** use `surface` shifts instead of lines to separate the sidebar from the main stage.
- **Do** allow for "Dead Space"—intentional empty areas that give the user's focus a place to rest.

### Don't
- **Don't** use 1px solid borders (`#E5E7EB` etc.) anywhere. It breaks the premium feel.
- **Don't** use uppercase for any headings. It creates "visual shouting" which contradicts our "Calm" mood.
- **Don't** use standard drop shadows (e.g., `0 4 6`). Use the multi-layered ambient approach.
- **Don't** use pure black (#000000). Use `gray-900` (#111827) for all dark elements to maintain the "Warm" professional tone.