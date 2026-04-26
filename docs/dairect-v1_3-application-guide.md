# dairect.kr v1.3 콘텐츠 적용 — 디자인 영향 분석 & 실행 가이드

> **작성일:** 2026-04-26
> **분석 대상:** v1.3 기획서의 13개 변경사항을 현재 "Studio Anthem" 디자인에 적용 시 영향
> **결론:** **기존 디자인 95% 보존 가능. Claude Design 호출 불필요.**

---

## 🎯 BLUF — 결론부터

**답: Claude Code에게 직접 지시하시면 됩니다. Claude Design은 호출할 필요 없습니다.**

근거:
- v1.3의 **13개 변경사항 중 11개가 "텍스트 교체"** 입니다 (디자인 변경 0)
- **2개만이 신규 컴포넌트** 필요 (REAL-TIME SCHEDULING 박스, 비교표)
- 두 신규 컴포넌트도 **기존 디자인 토큰만 재조합하면 만들 수 있습니다** — Claude Design이 새로 그릴 게 없습니다

비유하면 — **벽지를 새로 바르는 게 아니라, 액자 안의 사진만 바꾸는 작업**입니다. 액자(디자인)는 그대로, 사진(콘텐츠)만 교체. 인테리어 디자이너 부르지 않아도 본인이 하실 수 있는 일입니다.

**[확신: 매우 높음]**

---

## 📊 13개 변경사항 영향도 매트릭스

| # | v1.3 변경사항 | 변경 유형 | 디자인 영향 | 처리자 |
|---|------------|---------|-----------|-------|
| 1 | 히어로 카피 — "3개월 → 3주" 시간 강조 | 📝 텍스트만 | **없음** | Claude Code |
| 2 | 히어로 카운터 — "12 Projects" → "04 Live products" | 📝 텍스트만 | **없음** | Claude Code |
| 3 | 페르소나 섹션 신규 (히어로 직후) | ➕ 신규 섹션 | **재사용** | Claude Code |
| 4 | "왜 이렇게 빠를까요?" 비교표 신규 | ➕ 신규 섹션 | **재사용 + 새 테이블 1개** | Claude Code |
| 5 | Sprint 패키지 신규 (4번째 카드) | ➕ 카드 1개 | **기존 카드 복제** | Claude Code |
| 6 | REAL-TIME SCHEDULING 박스 신규 | ➕ 신규 컴포넌트 | **새 박스 + 점멸 도트** | Claude Code |
| 7 | Proof 섹션 — "Live 4 / Demos 8" 분리 | 📝 텍스트만 | **없음** | Claude Code |
| 8 | "현재 도전 중" 섹션 (모바일 학습) | ➕ 신규 섹션 | **재사용** | Claude Code |
| 9 | "이런 건 받지 않습니다" (Won't Do) | ➕ 신규 섹션 | **재사용** | Claude Code |
| 10 | "AI를 모르셔도 됩니다" 안심 섹션 | ➕ 신규 섹션 | **Founder 섹션 변형** | Claude Code |
| 11 | Ship & Handoff — 사업화 동행 흡수 | 📝 텍스트만 | **없음** | Claude Code |
| 12 | Build/Scale 카드 — "+14일 동행" 추가 | 📝 텍스트만 | **없음** | Claude Code |
| 13 | Footer — 법적 책임 명시 | 📝 텍스트만 | **없음** | Claude Code |

**합계:**
- 텍스트만 교체: **6건 (46%)**
- 기존 디자인 재사용 (신규 섹션): **6건 (46%)**
- 진짜 새 디자인 필요: **1건 (8%) — REAL-TIME SCHEDULING 박스**

→ 마지막 1건도 기존 토큰(amber, hairline, mono label)만 재조합하면 충분.

---

## 🔍 왜 Claude Design을 부르지 않아도 되나

### 이유 1: 기존 디자인이 이미 충분히 풍부합니다

현재 "Studio Anthem" 디자인 시스템에 다음이 모두 정의되어 있습니다:

```
✅ 색상: canvas / ink / signal / dust / rust / paper / smoke (7종)
✅ 타이포: Fraunces / Geist Sans / Geist Mono / Pretendard
✅ 컴포넌트 패턴:
   - 비대칭 카드 (Pricing 3개)
   - 모노 라벨 (Kicker)
   - amber 1px hairline 강조
   - 4px brand bar (Build 카드)
   - "MOST CHOSEN" 작은 라벨
   - 숫자 + 한글 조합 (Proof 섹션)
   - 1px hairline divider
✅ 상호작용:
   - hover hard shadow
   - magnetic CTA
   - count-up animation
```

신규 섹션들이 **모두 위 패턴의 재조합**으로 만들어집니다. 새 디자인 언어가 필요 없습니다.

### 이유 2: 신규 섹션의 "디자인 가이드"가 이미 기획서에 박혀 있음

기획서 자체가 디자인 시스템을 충실히 따라 작성되어 있습니다:

```
3-2 페르소나 섹션 디자인 가이드 (기획서 116-119행):
- 비대칭 카드 (균등 3컬럼 금지)
- AI 진입 장벽 카드 메인 강조 (좌측 brand 4px 바)
- 긴급 카드는 세 번째 배치
```

이 가이드는 현재 Pricing 섹션의 "MOST CHOSEN" Build 카드 패턴을 그대로 적용하라는 뜻. 새 디자인이 아닌 **기존 패턴의 적용**입니다.

### 이유 3: 시각적 일관성이 가장 큰 자산

지금 사이트는 NYT Magazine급 에디토리얼 일관성을 갖췄습니다. 여기에 Claude Design으로 새 섹션을 그려넣으면 **드리프트 위험**이 큽니다 — 특히 v3.6 출시한 Studio Anthem의 미세한 hairline 두께, mono 라벨 간격 같은 디테일은 재현 어려움. 

비유하면 — 명품 시계공이 이미 잘 맞춰놓은 시계 부품에 다른 공장에서 만든 부품을 끼우는 격입니다. 정확도가 미세하게 어긋납니다.

---

## 🚨 단 하나의 예외 — 진짜 신규 디자인이 필요한 곳

### REAL-TIME SCHEDULING 박스 (변경 #6)

이건 현재 사이트에 **유사한 패턴이 없는** 단일 신규 컴포넌트입니다.

```
┌──────────────────────────────────────────────────────┐
│ ◉ REAL-TIME SCHEDULING                               │
│   이번 주 의뢰 가능 슬롯 (자동 동기화)                  │
│                                                      │
│   Sprint  1자리 가능 — 24시간 안에 회신             │
│   Build   2자리 가능 — 다음 주 시작                  │
│   Scale   2주 대기 — 화이트리스트 적합도 먼저 회신  │
│                                                      │
│   * 자체 발주·일정관리 시스템과 자동 연동             │
└──────────────────────────────────────────────────────┘
```

**그러나 이것도 Claude Design 불필요한 이유:**
- 박스 = 1px hairline border (이미 사용 중)
- 라벨 = mono uppercase (이미 사용 중)
- 점멸 도트 ◉ = amber #FFB800 + CSS 애니메이션 (단순)
- 행 = grid layout (이미 사용 중)

→ Claude Code가 기존 패턴 보고 만들 수 있음.

---

## 📋 적용 전략 — 2가지 트랙

### 🥇 트랙 A: Claude Code 단독 (권장) ⭐

**언제:** 13개 변경사항 모두

**소요:** 6-8시간 (3일에 분산)

**프롬프트 한 줄:**
```
@PROGRESS.md 참조하여 v1.3 콘텐츠 리포지셔닝을 적용합니다.
첨부한 dairect-content-replan-v1_3.md를 단일 source of truth로 삼고,
Day 1 P0 작업부터 순차 진행해주세요.
```

(상세 프롬프트는 아래 §3 참조)

### 🥈 트랙 B: Claude Design + Claude Code (제한적)

**언제:** REAL-TIME SCHEDULING 박스 디자인이 마음에 안 들 때만

**소요:** 추가 1-2시간

**조건:** 트랙 A로 먼저 만들어보고 결과가 어색하면 그때만.

---

## 🎬 Claude Code 통합 지시 프롬프트 (3 Day 분산)

> **사용법:** Claude Code 세션에 아래 프롬프트를 Day 단위로 순차 실행.
> 각 Day가 완료되면 OAR 보고 + git commit 후 다음 Day 진입.

### Day 1 — P0 작업 (메시지 핵심) [3시간]

```
@CLAUDE.md, @PROGRESS.md, @docs/dairect-content-replan-v1_3.md를 먼저 읽어주세요.

오늘은 v1.3 P0 작업 5개를 적용합니다. 모두 텍스트 교체 + 신규 컴포넌트 1개입니다.
디자인 시스템(Studio Anthem)은 절대 건드리지 마세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## P0-1: 히어로 비교 라인 (시간 강조)
파일: src/components/landing/hero.tsx 또는 동등 컴포넌트
변경:
  - 기존 서브헤드 유지
  - 새 라인 추가:
    "일반 개발사가 3개월 들이는 일을, 저희는 3주에."
  - 기존 카운터 "12 / projects" → "04 / live products" 로 라벨 변경
  - 변경 후 카운터 grid: "04 Live products · 2.1주 · 98%"
주의:
  - 기존 폰트, 크기, 색상, 간격 절대 변경 X
  - 새 라인은 기존 서브헤드와 동일 스타일

## P0-2: 비교표 신규 섹션
파일: src/components/landing/why-this-works.tsx (신규)
배치: Manifesto와 Proof 사이
디자인:
  - section padding: 기존 섹션과 동일 (160px desktop)
  - 배경: canvas (밝게, ink section 다음에 오므로)
  - Kicker: "— WHY THIS WORKS" (mono, dust)
  - 헤드라인 (Fraunces): "왜 이렇게 빠르고 저렴할까요?"
  - 본문 (Pretendard): 기획서 §3-3 본문 그대로
  - 비교표:
    * 3행 × 3열 그리드 (헤더 1줄 + 데이터 3줄)
    * 행 사이 1px hairline border-top (canvas hairline)
    * 폰트: 라벨은 Geist Mono 13px, 숫자는 Fraunces 28px
    * 비교 비율("1/10")은 amber 색
    * 캡션 단서 조항: 11px mono dust
주의:
  - shadcn Table 컴포넌트 사용 금지 — 기존 사이트에 없음
  - 순수 div + grid로 만들어 기존 미니멀 스타일 보존

## P0-3: Sprint 패키지 카드 추가
파일: src/components/landing/pricing.tsx
변경:
  - 기존 3개 카드(Discovery / Build / Scale) → 4개로 확장
  - 첫 번째 자리에 Sprint 카드 신규 삽입
  - 4-card grid로 레이아웃 변경 (현재 3-col → 4-col)
디자인:
  - Sprint 카드는 다른 카드와 동일한 visual weight
  - 단, "PKG N°00" 라벨로 시각적 구분 (다른 카드는 N°01~N°03)
  - 가격: "150~200만원~" (Fraunces, 다른 카드와 동일 크기)
  - 화이트리스트는 ✓/✗ 리스트 (기획서 §3-4 그대로)
  - CTA 버튼: 다른 카드와 동일 (pill ink button)
주의:
  - 모바일 반응형: 4-card → 1-column으로 stack
  - "MOST CHOSEN" 라벨은 Build에만 유지 (Sprint X)

## P0-4: REAL-TIME SCHEDULING 박스 ⭐ 핵심
파일: src/components/landing/scheduling-status.tsx (신규)
배치: Pricing 섹션 상단 (헤드라인 아래, 카드 위)
디자인:
  - 컨테이너: 1px solid hairline (canvas hairline 색)
  - 배경: paper (#FAF7F0) — 기존 paper 사용
  - padding: 32px
  - radius: 0 (기존 카드와 동일)
  - 좌측 점멸 도트: amber circle 8px, CSS animation pulse 2s infinite
  - 라벨 "REAL-TIME SCHEDULING": Geist Mono 11px amber uppercase
  - 부제: Pretendard 14px dust
  - 슬롯 행 3개:
    * 그리드 3-9 (이름 1 / 상태 2)
    * 패키지명: Fraunces italic 18px
    * 상태: Pretendard 15px ink (em-dash로 구분)
  - 하단 캡션: "* 자체 발주·일정관리 시스템과 자동 연동" mono 11px dust
구현:
  - 슬롯 데이터는 일단 하드코딩 (status: 'available' | 'next-week' | 'waiting')
  - 추후 Supabase 연동 (별도 Task)
  - 카피 분기 로직: status에 따라 자동 변경 (기획서 §3-4 분기표 참조)
주의:
  - "마감되었습니다" 단독 표현 절대 금지
  - 항상 "다음 가능 시점" 노출

## P0-5: Proof 섹션 카운터 분리
파일: src/components/landing/proof.tsx
변경:
  - 기존 4개 메트릭 (12 / 5억 / 2.1주 / 98%) 
  - 새 구조:
    * 좌측: "04 / Live products" + 부제 "실제 사용자가 매일 쓰고 있는 제품"
    * 우측: "08 / Demos & experiments" + 부제 "데모, 음성 자동화, 개인 실험"
    * 하단 행: "2.1주 평균기간 · 98% CSAT · 100% 직접 만든 것"
디자인:
  - 04 / 08 숫자: 기존 12 와 동일 크기 (Fraunces 80px)
  - 04 와 08 사이 1px hairline 세로 divider
  - 04 옆에 amber 작은 점 (라이브 강조)
  - 08 은 dust 색조 약간 (실험 차별화)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 작업 방식 (엄수)
1. 작업 전 수정 대상 파일 목록 보여주고 승인 받기
2. 한 P0 항목씩 순차 진행, 각 완료 시 localhost:3700 시각 확인
3. 완료 후 OAR 보고 (Observation/Action/Rationale)
4. tsc/lint/build 검증 통과 후 다음 항목
5. 5개 모두 완료 후 git commit 제안

## 금지
- Studio Anthem 디자인 토큰 변경 금지
- shadcn 컴포넌트 신규 import 금지 (기존 사이트에 없는 패턴)
- soft shadow, rounded-lg 등 기존 시스템 위반 금지
- 모바일 반응형은 기존 패턴 그대로 따르기
```

### Day 2 — P1 작업 (정직성 시그널) [2-3시간]

```
Day 1 완료 확인했습니다. 이제 Day 2 P1 작업 6개를 진행합니다.
모두 신규 섹션이지만, 기존 디자인 토큰만 재조합하면 됩니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## P1-1: 페르소나 섹션 신규
파일: src/components/landing/who-this-is-for.tsx (신규)
배치: Hero 직후, ETYMOLOGY 직전
디자인:
  - Kicker: "— WHO THIS IS FOR" (mono dust)
  - 헤드라인: "세 가지 상황에서 가장 빛납니다." (Fraunces)
  - 카드 3개 비대칭:
    * 카드 1 (AI 진입 장벽): 좌측 4px amber bar, 메인 강조
    * 카드 2 (검증 필요): 표준 hairline 카드
    * 카드 3 (긴급): 표준 hairline 카드, 약간 dust 색조
  - 카드 내부:
    * 라벨 "01 / AI 진입 장벽" (mono amber 11px)
    * 인용 카피 (Fraunces italic, 16px)
    * 본문 (Pretendard 15px)
    * 패키지 링크 "→ Build 패키지 (2~3주)" (mono 13px ink)
  - grid: desktop 3-col, tablet 2-col + 1, mobile stack

## P1-2: "현재 도전 중" 섹션 신규
파일: src/components/landing/whats-learning.tsx (신규)
배치: Pricing 직후
디자인:
  - Kicker: "— WHAT WE'RE LEARNING"
  - 헤드라인: "도전 중인 영역을 공개합니다."
  - 학습 항목 카드 2개:
    * 모바일 앱 (📱)
    * 모바일 IAP (💳)
    ⚠️ 이모지 사용 — Studio Anthem은 보통 이모지 금지지만,
       이 섹션의 "정직 공개" 톤에 맞아 예외적 허용
       단, 1픽셀 단위 정렬 + 같은 사이즈로 통일
  - 카드 내부 (수직 스택):
    * 영역명 (Fraunces 22px)
    * "상태:" / "진행 상황:" / "첫 외부 의뢰 조건:" 라벨 (mono 11px dust)
    * ✓/✗ 리스트
    * 정책 박스: "30% 할인 + 일정 1.5배 여유 + 처음 도전 명시"
       → 이 박스만 paper 배경 + amber 1px border
  - "X/Threads에서 학습 일지 공유 중" 링크 추가

## P1-3: "이런 건 받지 않습니다" 섹션 (Won't Do)
파일: src/components/landing/wont-do.tsx (신규)
배치: WHAT WE'RE LEARNING 직후
디자인:
  - 어두운 배경 ❌ (현재 dark section은 Manifesto/Work/Founder/Footer 4개로
    이미 충분, 추가 dark는 리듬 깨짐)
  - 대신 canvas 배경 + rust 색 1px border 좌측 4px bar로 시각 강조
  - Kicker: "— BOUNDARIES" (mono rust)
  - 헤드라인: "받지 않는 의뢰가 있습니다." (Fraunces)
  - 2-column grid:
    * 좌: "가치 정렬 문제" + ✗ 리스트 4개
    * 우: "지금은 안전하게 못 만듭니다" + ✗ 리스트 5개
  - 하단 캡션: "이런 의뢰가 오시면 가능한 다른 곳을 소개해드립니다." (Pretendard italic)

## P1-4: "AI를 모르셔도 됩니다" 섹션
파일: src/components/landing/no-ai-experience.tsx (신규)
배치: Won't Do 직후
디자인:
  - 배경: ink (다크) — 안심 메시지를 부드럽게 강조
  - Kicker: "— NO AI EXPERIENCE NEEDED" (mono amber)
  - 헤드라인 (Fraunces, canvas 색):
    "ChatGPT를 안 써보셔도 됩니다."
    "Claude가 뭔지 몰라도 됩니다."
  - 큰 인용문 (Fraunces italic):
    "AI는 자동차입니다. 운전을 못해도 괜찮아요."
    "택시를 타면 되니까요. 저희가 운전합니다."
    → "운전을 못해도 괜찮아요" amber 강조 (Founder 섹션과 일관성)
  - 2-column grid:
    * 좌: "저희가 맡는 것" ✓ 리스트
    * 우: "같이 해주셔야 하는 것 한 가지" • 리스트
  - 하단: "한국어로, 일상 언어로만 대화합니다." (Pretendard center)

⚠️ 주의: 이 섹션이 Founder 섹션과 시각적으로 너무 비슷하지 않도록
  - Founder는 Jayden 초상 + 인용
  - 이 섹션은 인용만, 레이아웃 다르게 (2-col)

## P1-5: Ship & Handoff 카피 갱신
파일: src/components/landing/services.tsx
변경:
  - 04번 카드 (Ship & Handoff) 의 부제 추가:
    기존: "완성 및 이관"
    신규: "완성 및 이관 + 사업화 동행"
  - 라벨 변경:
    기존: "— HANDED BACK TO YOU"
    신규: "— HANDED BACK TO YOU, GROWN TOGETHER"
  - 본문 추가:
    "이후 Build 패키지는 14일 운영 자문, Scale 패키지는 90일 파트너십이
     포함되어 첫 사용자·첫 매출까지 동행합니다."
  - 태그 칩 추가:
    < 14D SUPPORT (BUILD) />
    < 90D PARTNERSHIP (SCALE) />

## P1-6: Pricing 카드에 사업화 동행 + 14일 자문 추가
파일: src/components/landing/pricing.tsx
변경:
  - Build 카드 (PKG N°02) 본문 끝에 1줄 추가:
    "+ 첫 사용자 확보까지 14일 동행"
    스타일: amber + Pretendard weight 500
  - Build 카드 features 리스트에 추가:
    "+ 14일 슬랙 자문 (월 5회, 24h SLA)"
  - Scale 카드 (PKG N°03) 본문 끝에 1줄 추가:
    "+ 첫 매출 발생까지 90일 파트너십"
    스타일: amber + Pretendard weight 500

## P1-7: Footer 법적 책임
파일: src/components/landing/footer.tsx
변경:
  - 기존 Fine Print 섹션 아래에 작은 안내 박스 추가:
    "각 패키지는 표준 계약서에 따라 진행됩니다."
    + 5개 항목 리스트 (기획서 §3-11)
  - 디자인:
    * mono 11px dust
    * 1px hairline 위
    * 좌우 padding 동일

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 작업 방식
Day 1과 동일: 한 P1 항목씩 순차 진행 + OAR 보고

## 검증
- 각 신규 섹션이 모바일 (390px), 태블릿 (768px), 데스크탑 (1440px)에서 정상
- 새 섹션 추가로 전체 페이지 길이가 변하므로 IntersectionObserver 재확인
- 다크/라이트 섹션 리듬 (canvas → ink → canvas 교차) 유지
```

### Day 3 — P2 작업 (마무리) [1-2시간]

```
Day 1, 2 완료 확인했습니다. 이제 Day 3 P2 마무리 작업입니다.
About 페이지 + 카운터 정정 + 측정 도구 설정.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## P2-1: About 타임라인 헤드라인 정정
파일: src/app/(public)/about/page.tsx 또는 동등 위치
변경:
  - 기존: "Six months, ten projects."
  - 신규: "6개월간, 라이브 4. 실험 8. 그래서 13번째도 안전합니다."
  - 한글 + 숫자 조합으로 변경 (영문 단독에서)
디자인:
  - Fraunces 로 유지 (한글이지만 큰 임팩트)
  - "라이브 4" amber 강조

## P2-2: About 타임라인에 "다음 도전" 추가
파일: 위와 동일
변경:
  - 타임라인 마지막 항목 추가:
    연도: "2026 · 학습 중"
    제목: "Mobile, simply." (Fraunces italic)
    본문: "첫 모바일 앱 학습 중. 단순 앱부터, 결제·푸시는 그 다음에."
  - 시각적 처리: dust 색으로 미래/진행중 표현

## P2-3: GA4 이벤트 측정 셋업
파일: src/lib/analytics.ts (신규 또는 확장)
구현:
  - 페르소나 카드 클릭 → 'persona_card_click' (label: 'ai-barrier' | 'validation' | 'urgent')
  - Sprint 패키지 클릭 → 'pricing_click' (label: 'sprint')
  - REAL-TIME SCHEDULING 슬롯 클릭 → 'schedule_click'
  - Won't Do 섹션 도달 → 'wont_do_view' (IntersectionObserver)
  - Live products 카운터 클릭 → 'live_counter_click'
구현 방법:
  - useGA4 훅 신규 작성 또는 기존 훅 확장
  - data-event 속성 + 클릭 핸들러 패턴

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 최종 검증
- Lighthouse 4종 측정 (Performance / Accessibility / Best Practices / SEO)
- Vercel Preview 배포 후 모바일 실기기 테스트
- v1.3 P0/P1/P2 13건 모두 적용 완료 체크리스트
```

---

## 🎨 만약 REAL-TIME SCHEDULING 박스가 마음에 안 든다면 (Plan B)

Day 1 완료 후 결과를 봤을 때 **유일하게 Claude Design을 부를 가치가 있는 부분**입니다. 그 외 모든 신규 섹션은 Claude Code로 충분합니다.

### Claude Design 보조 호출 프롬프트 (선택적)

```
[Claude Design 채팅창]

기존 dairect.kr 디자인은 그대로 유지합니다.
다만 Pricing 섹션에 새 컴포넌트 1개만 추가가 필요합니다.

## 컴포넌트: REAL-TIME SCHEDULING 박스

이 박스는 자체 발주 시스템과 연동되어 실시간 슬롯 상태를 표시합니다.

## Goal
SI/일반 프리랜서가 갖지 못한 "시스템적 차별점"을 시각화하는 것.
"수동으로 업데이트되는 텍스트"가 아니라 "자동 동기화되는 시스템"으로 보여야 함.

## 디자인 시스템 (Studio Anthem 그대로)
- 색상: canvas / ink / signal (amber #FFB800) / dust / paper
- 폰트: Fraunces / Geist Mono / Pretendard
- 모서리: 0 (no border-radius)
- 그림자: hard brutalist만 사용
- 1px hairline borders

## 레이아웃
박스 1개, Pricing 섹션의 카드 그리드 위에 배치.
폭은 Pricing 그리드와 동일 (max-width 1200px).

내부:
1. 좌측 상단: 점멸 amber 도트 ◉ + "REAL-TIME SCHEDULING" 라벨
2. 라벨 아래: "이번 주 의뢰 가능 슬롯 (자동 동기화)" 부제
3. 슬롯 3개 행:
   - Sprint  |  1자리 가능 — 24시간 안에 회신
   - Build   |  2자리 가능 — 다음 주 시작
   - Scale   |  2주 대기 — 화이트리스트 적합도 먼저 회신
4. 하단 작은 캡션: "* 자체 발주·일정관리 시스템과 자동 연동"

## 핵심 디자인 결정 요청
1. 점멸 도트의 시각적 무게 (너무 작으면 안 보이고, 너무 크면 산만)
2. "1자리 가능" 같은 상태 표시의 시각적 강조 방식 (amber? 단순 텍스트?)
3. 박스 자체의 배경 (paper로 살짝 뜰까, canvas와 동일하게 hairline만 둘까)

## 출력
이 박스 1개의 다양한 변형 3개를 보여주시고, 각 장단점을 비교해주세요.
저는 이 중 1개를 선택하여 Claude Code로 구현 의뢰할 예정입니다.
```

---

## 📊 변경 전/후 시각적 영향 예측

### Before (현재) — 10 섹션
```
01 Nav
02 Hero
02.5 Etymology
03 Manifesto (dark)
04 Proof
05 Services
06 Work (dark)
07 Pricing
08 Founder (dark)
09 Contact
10 Footer (dark)
```

### After (v1.3 적용) — 14 섹션
```
01 Nav
02 Hero  ← 카피 수정
02.3 Personas  ⭐ 신규
02.5 Etymology
03 Manifesto (dark)
03.5 Why This Works (비교표)  ⭐ 신규
04 Proof  ← Live 4 / Demos 8 분리
05 Services  ← Ship & Handoff 카피 강화
06 Work (dark)
07 Pricing  ← Sprint 추가 + 14일/90일 + REAL-TIME SCHEDULING ⭐
07.3 What We're Learning  ⭐ 신규
07.5 Won't Do  ⭐ 신규
07.7 No AI Experience  ⭐ 신규 (dark)
08 Founder (dark)
09 Contact
10 Footer (dark)  ← 법적 책임 추가
```

### 다크/라이트 리듬 검증

```
01 ─ canvas (Nav)
02 ─ canvas
02.3 ─ canvas (신규)
02.5 ─ canvas
03 ─ ink (dark) ✓
03.5 ─ canvas (신규)
04 ─ canvas
05 ─ canvas
06 ─ ink (dark) ✓
07 ─ canvas
07.3 ─ canvas (신규)
07.5 ─ canvas (신규)
07.7 ─ ink (dark) ✓ — 신규 다크 섹션 추가됨
08 ─ ink (dark) ✓
09 ─ canvas
10 ─ ink (dark) ✓
```

⚠️ **잠재 이슈:** 07.7 (No AI Experience)와 08 (Founder)가 둘 다 dark — **연속 dark 섹션 발생**.
**해결:** No AI Experience 섹션을 canvas로 변경하되, 좌측 4px amber bar로 강조. 또는 Founder 섹션 직전에 spacer 1px hairline divider 추가.

이 결정도 Claude Code에게 맡기되, "연속 다크 섹션 회피" 제약을 명시하면 됩니다.

---

## ✅ 최종 권장사항

### 추천 실행 순서

```
Step 1 (오늘) → Day 1 P0 프롬프트 복붙 → Claude Code 실행
Step 2 (내일) → 결과 검토. REAL-TIME SCHEDULING 박스 OK?
                YES → Day 2 P1 진행
                NO  → 위 Plan B로 Claude Design에 1개 컴포넌트 의뢰
Step 3 (모레) → Day 2 P1 적용
Step 4 (Day 4) → Day 3 P2 적용
Step 5 (4주 후) → GA4 측정 데이터로 v1.4 기획
```

### 핵심 메시지

> **현재 디자인을 사랑하신다면, 사랑하는 그대로 두세요.**
>
> v1.3은 "디자인을 더 좋게 만드는 작업"이 아니라
> **"메시지를 더 정직하게 만드는 작업"** 입니다.
>
> 디자인은 이미 NYT Magazine 수준이고,
> 콘텐츠를 그 수준으로 끌어올리는 게 v1.3의 본질입니다.
>
> 그래서 **Claude Design은 부르지 않아도 됩니다.** Claude Code 단독으로 충분합니다.

---

## 💬 자주 묻는 질문

**Q1. 정말 Claude Design을 안 불러도 되나? 새 섹션이 6개나 되는데?**
A. 6개 모두 **기존 패턴의 재조합**입니다. 페르소나 = Pricing 카드 변형, 비교표 = 단순 grid, Won't Do = 2-col 리스트, "AI 모르셔도" = Founder 변형, "현재 도전" = 기획서에 디테일 박힘. 새 디자인 언어가 0개입니다.

**Q2. Claude Code가 디자인 일관성을 깨뜨리지 않을까?**
A. 깨뜨릴 가능성은 있지만 **방지 가능**합니다:
- 위 프롬프트에 "Studio Anthem 디자인 토큰 변경 금지" 명시
- 작업 전 수정 파일 목록 사전 승인 요청
- 한 P0 항목씩 순차 진행 + 시각 확인
- shadcn 신규 import 금지

**Q3. 신규 섹션 6개를 한 번에 추가하면 너무 길어지지 않나?**
A. 길어집니다. 현재 약 12 viewport → 약 18 viewport. 하지만:
- 페르소나 + Won't Do + 도전 중은 **타깃 세분화**라 끝까지 안 읽는 사람도 OK
- 정확히 자기 상황과 맞는 섹션만 읽는 게 정상 패턴
- 모바일에서는 자연스러운 스크롤 흐름

**Q4. GA4 이벤트 셋업이 너무 부담스러우면?**
A. P2-3은 **선택**입니다. Day 1, 2만 적용하고 P2-3은 나중으로 미뤄도 됩니다. 단 측정 없으면 v1.4 결정에 데이터 없이 직관으로만 가야 함.

**Q5. v1.3 적용 중에 추가 변경이 생기면?**
A. v1.3.1로 별도 기획서 만든 후 적용. 작업 중 즉흥 변경은 **스코프 크리프 금지** 원칙으로 차단.

---

**"디자인은 사랑받는 그대로, 메시지는 정직하게."**

— 2026-04-26, Claude × Jayden
