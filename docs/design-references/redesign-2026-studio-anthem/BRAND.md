# dairect — Brand Identity (Studio Anthem)

> **출처**: `docs/design-references/design_handoff_studio_anthem/CLAUDE.md`
> (Claude Design Handoff 번들의 브랜드 규칙 원본)
>
> **이관 일자**: 2026-04-24 (feat/redesign-studio-anthem Epic 1 Task 1-2)
>
> **역할**: 본 문서는 **브랜드 아이덴티티 규칙서**입니다. 워드마크, 로고,
> 슬로건, 타이포 매핑 등 모든 신규 작업에 적용해야 하는 최상위 레이어.
>
> **관계**:
> - 기존 `docs/design-references/redesign-2026/DESIGN.md` (The Intelligent Sanctuary) — ⛔ 폐기
> - 루트 `CLAUDE.md` — 프로젝트 전반 규칙 (이 BRAND.md를 참조)

이 프로젝트는 **"The Studio Anthem"** 디자인 언어를 기반으로 합니다.
기존 design system (color tokens, typography, layout grid, motion) 위에
아래 **Brand Identity** 규칙이 최상위 레이어로 적용됩니다.

---

## 🎯 TOP PRIORITY — Brand Identity

### Name Origin
워드마크 **"dairect"** 는 세 어원의 합성:

| 음절 | 의미 | 역할 |
|------|------|------|
| **D** | Director | Jayden, 지휘자 (인간) |
| **AI** | Artificial Intelligence | 실행 엔진 (기계) |
| **RECT** | Direct | 방향, 직접성 (결과물) |

### 🔤 Logo Rules (워드마크 등장 시 필수 적용)

#### Rule 1 — 기본 단일 컬러 상태 (본문, small usage)
- 전체 `dairect` 는 `var(--ink)` 또는 `var(--canvas)` **단일 색**
- 단, 마지막 `.` (마침표)은 **항상 `var(--signal)` amber**

```html
<span class="brand">dairect<span class="dot">.</span></span>
```

#### Rule 2 — 강조 상태 (hero, footer large wordmark, nav hover)
- `d` 와 `rect` 는 배경 대비 base 색
- `ai` (가운데 2글자)는 **반드시 signal amber (#FFB800)**
- 이유: 워드마크 자체가 어원을 시각적으로 드러내야 함

```html
<span class="brand-split">
  <span class="bp-d">d</span><span class="bp-ai">ai</span><span class="bp-rect">rect</span><span class="dot">.</span>
</span>
```

#### Rule 3 — 분해 상태 (ETYMOLOGY 섹션 전용)
- `D . AI . RECT` 세 부분을 공백 + `.` separator로 분리
- 각 부분 아래 **Geist Mono 라벨**:
  - `D` → `DIRECTOR`
  - `AI` → `ARTIFICIAL INTELLIGENCE` (amber)
  - `RECT` → `DIRECT`
- 각 글자는 Fraunces weight 300, `clamp(80px, 14vw, 200px)`
- AI만 weight 500 + italic + amber

---

### 💬 Core Slogan (원본 DNA, 보존)

- **KO:** `코드는 AI가, 방향은 내가.`
- **EN:** `"Code by machines. Direction by us."`

**적용 규칙:**
| 위치 | 사용 |
|------|------|
| Footer | **반드시 포함** (이중 언어) |
| Hero | ❌ **직접 노출 금지** (리브랜딩 메인 카피가 우선) |
| Manifesto / Etymology / About | ✅ 재등장 가능 |

Hero의 메인 카피는 최신 버전 사용 ("머릿속 아이디어를 / 진짜로 만들어드립니다").

---

### ⚖️ Dual Axis — "Direction × Execution"

모든 카피는 이 이중 축을 의식해야 합니다:

| 축 | 속성 | 폰트 | 색 (카피 강조 시) |
|---|---|---|---|
| **Direction** | 방향, 인간, 따뜻함 | **Fraunces Italic** | signal amber |
| **Execution** | 실행, 기계, 정확함 | **Geist Mono** | ink / canvas |

**시각화 규칙:**
- `direction` 이라는 단어는 가급적 `font-family: var(--font-serif); font-style: italic;`
- `execution` 이라는 단어는 가급적 `font-family: var(--font-mono);`
- 한 문장에 두 단어가 함께 등장하면 **폰트 믹스로 시각 대조**

예시:
```html
<h2>We sell <em class="dir-italic">direction.</em> And <code class="exec-mono">execution.</code></h2>
```

---

### 🎭 Persona Word — "Vibe Architect"

Jayden의 자기 정의. **노출 제한** 엄격:

| 페이지 | 사용 |
|--------|------|
| 랜딩 메인 (`/`) | ❌ **노출 금지** (타겟이 비개발자 창업가라 철학적이면 부담) |
| About (`/about`) | ✅ 사용 가능 |

사용 시 형태: **대문자 mono label**
```html
<span class="persona-label">VIBE ARCHITECT</span>
```
→ `font-family: var(--font-mono); letter-spacing: 0.18em; color: var(--signal);`

> ⚠️ 현재 랜딩의 Founder 섹션에 `Vibe Architect · Dairect · Seoul` 한 줄이 있음. 이건 작은 role 라벨이라 유지 허용. 대형 헤드라인·CTA로는 쓰지 말 것.

---

### 🔠 Typography-Origin Mapping

워드마크 어원을 타이포 계층에 매핑:

| 어원 | 영역 | 폰트 | 사용처 |
|------|------|------|--------|
| **Director** | 인간적 감성 | **Fraunces Serif** | 헤드라인, manifesto, 인용문, 에디토리얼 subhead |
| **AI** | 기계/수치 | **Geist Mono** | 뱃지, 태그, 메트릭 숫자 suffix, kicker, 라벨 |
| **Direct** | 결과물/중립 | **Geist Sans + Pretendard** | 본문, UI, 설명 |

**의사결정 간단 규칙:**
- "감성/느낌"이 필요하면 → Fraunces
- "정확한 수치/code/meta"라면 → Geist Mono
- 그 외 모든 본문 → Geist Sans (영) + Pretendard (한)

---

## ⚙️ 자동 적용 규칙 (이 프로젝트 내 모든 후속 작업)

1. **"dairect" 워드마크가 등장할 때마다 Logo Rule 1/2/3 중 상황에 맞는 것 적용.** 단색 로고 + amber dot이 가장 안전한 기본.
2. **Footer에는 원본 슬로건 `"Code by machines. Direction by us." / "코드는 AI가, 방향은 내가."` 를 반드시 포함.**
3. **`direction`, `execution` 단어가 본문에 나오면 폰트 자동 믹스 (Fraunces italic / Geist Mono).**
4. **ETYMOLOGY 섹션이 필요한 페이지 (`/`, `/about`)에서는 `Landing.html`의 `[02.5]` 블록 배치 규칙 따르기** — Hero 직후, Manifesto 직전.
5. **`Vibe Architect` 는 About 페이지 전용.** 랜딩 hero·CTA·nav에 등장 금지.
6. **모든 기존 "The Studio Anthem" 규칙 (Amber + Charcoal + Cream 팔레트, Fraunces/Geist/Pretendard만 사용, 1px hairline, sharp shadow, 비대칭 12col grid, `prefers-reduced-motion` 존중) 은 계속 유효.**

---

## 📁 기존 design system 참조

- 전체 시스템 인덱스: `/projects/c944b789-e9d4-4c1f-b908-104536a0f79b/`
- 현재 구현 레퍼런스: `Landing.html` + `landing.css` + `Hero.html`
- 반복 사용 컴포넌트 클래스:
  - Nav split brand: `.nav .brand .bp-d / .bp-ai / .bp-rect`
  - Etymology section: `.etymology / .etym-wordmark / .etym-glyph / .etym-label`
  - Service role tags: `.service-role`
  - Footer split wordmark: `.footer-logo-split .fl-d / .fl-ai / .fl-rect`
  - Manifesto amber highlight: `.manifesto-head .amber`, `.manifesto-ko .ko-amber`

새 페이지/아트보드를 만들 때 이 클래스들을 재사용할 것 — 새로 정의하지 말 것.
