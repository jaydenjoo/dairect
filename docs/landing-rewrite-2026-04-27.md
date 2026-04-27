# Dairect 랜딩 재기획 — 비전문가 5초 룰 통과 (2026-04-27)

> **상태**: Step 1 진단·학습·재기획안 완료 (코드 변경 0). Jayden 검토 후 Step 2에서 우선순위별 단계 적용.
> **트리거**: 사용자 피드백 — "그래서 뭐 해주는 곳이야?"가 첫인상 (5초 룰 실패)
> **페르소나**: ① 사업하는 50~60대 비IT 사장님 ② 30~40대 비IT 창업자/기획자
> **예시 형태**: 가상 시나리오 ("김사장님은 빵집 사장이세요...")
> **유관 문서**: [BRAND.md](design-references/redesign-2026-studio-anthem/BRAND.md), [PRD-v3.2-single-user.md](PRD-v3.2-single-user.md), [PROGRESS.md](../PROGRESS.md)

---

## 1. 외부 학습 핵심 (오늘 기준 검색 4회)

### 1-1. 5초 룰 (5-Second Test)
- **데이터**: 방문자 55%가 15초 미만 체류. 첫 5초 안에 가치 제안 못 박히면 이탈.
- **통과 기준**: 친숙하지 않은 사람에게 보여주고 5초 후 두 질문을 했을 때 80% 이상이 답해야:
  - **Q1. "이 사이트는 뭘 해주는 곳인가요?"**
  - **Q2. "누구를 위한 곳인가요?"**
- **dairect 현재 상황**: 두 질문 모두 5초 안에 답 안 나옴 → 실패

### 1-2. Donald Miller "Grunt Test" (3가지 질문)
방문자가 5초 안에 답할 수 있어야 할 3가지:
1. **"무엇을 제공하나요?"** (What do you offer?)
2. **"내 삶을 어떻게 더 낫게 해주나요?"** (How will it make my life better?)
3. **"어떻게 사면 되나요?"** (What do I need to do to buy?)

### 1-3. Steve Blank 공식 (가장 단순한 헤드라인 패턴)
> **"We help (X) do (Y) by doing (Z)."**
> 한국어: **"[X]가 [Y] 하도록 [Z]로 도와드립니다."**

**예시 변환** (dairect):
- "비개발자 사장님이 머릿속 아이디어를 진짜 작동하는 웹사이트·앱·챗봇으로 만들도록, AI로 2~3주 만에 만들어드립니다."

### 1-4. Geoffrey Moore "For X Who" 공식
> **"For (target customer) who (need), our (product) is (category) that (key benefit)."**
> 한국어: **"[X 분]께, [Y가 필요한 분]께, dairect는 [Z]를 [W하게] 해드립니다."**

### 1-5. Jobs To Be Done (JTBD) — Jayden 요청 시나리오 정확히 일치
- **금지**: 추상적 혜택 ("시간 절약", "비용 절감", "쉬운 방법") — 비전문가 머리에 그림 안 그려짐
- **권장**: 구체적 "struggling moment" 시나리오 — "김사장님은 빵집 사장이세요. 단골 100명 카톡 그룹이 있는데, 주문 받을 때마다 메시지가 섞여서..."
- **이유**: 페르소나가 자기 모습을 발견 → "어, 이거 내 얘긴데?" → 5초 안에 "나를 위한 곳" 인식

---

## 2. 진단 매트릭스 — 현재 dairect.kr 페르소나 관점 분석

### 2-1. 5초 후 비전문가 시뮬레이션

**Hero 영역에서 5초 안에 보이는 것** (현재):
```
키커:    — A STUDIO directed BY HUMAN, executed BY AI    [영어, 추상]
H1:      머릿속 아이디어를 진짜로 만들어드립니다.       [정서적 ✓]
서브:    Human directs. Machine executes.              [영어, 시적]
         And the page looks like both.                  [영어, 시적]
본문 1줄: 코드는 AI가, 방향은 저희가.                   [한글 OK]
본문 2줄: 비개발자 창업가와 중소기업의 아이디어를,      [여기서야 명확]
         2~3주 안에 작동하는 제품으로.
```

**페르소나 50~60대 사장님 머릿속**:
- "STUDIO? directed BY HUMAN? 영어 써도 모르겠는데..."
- "머릿속 아이디어를 만들어준다? 뭘? 그림? 음악? 사업계획서?"
- "Human directs Machine executes... 또 영어. 패스."
- (5초 종료) → **5초 안에 답 안 나옴**

### 2-2. 섹션별 진단

| 섹션 | 현재 카피 핵심 | 비전문가 진단 | 우선순위 |
|------|---------------|------------|---------|
| **Hero 키커** | "— A STUDIO directed BY HUMAN, executed BY AI" | 🔴 영어 + 추상. 5초 룰 실패의 핵심 원인 | P0 |
| **Hero H1** | "머릿속 아이디어를 진짜로 만들어드립니다." | 🟡 정서성 ✓ but 무엇 만드는지 모호 | P0 (보존, 서브에서 즉시 명확화) |
| **Hero 서브** | "Human directs. Machine executes. And the page looks like both." | 🔴 영어 시적 카피, 비전문가 못 읽음 | P0 |
| **QuickAnswer** | "AI 개발 프리랜서가...2~3주...1/3 비용...Sprint 180만원" | 🟢 명확함. 다만 "Sprint" 영어 | P1 |
| **WhoThisIsFor** | 3 페르소나 카드 (AI 진입 장벽 / 검증 / 긴급) | 🟡 카드 카피 OK but 가상 시나리오 부재 | P1 |
| **Etymology** | "DAI · RECT — 어원" | 🔴 비전문가에겐 외계어. 결과물 보고 싶은데 자기 이름 풀이 | P2 (후순위로 이동 또는 /about) |
| **Manifesto** | "Studio 선언" | 🔴 자기 선언. "그래서 결과물?" 답 안 됨 | P2 |
| **WhyThisWorks** | "왜 작동하는가" | 🟡 설명적 but 길이 과다 | P2 (압축) |
| **Proof** | 사회적 증명 | 🟢 유지 | - |
| **Services** | 4 패키지 영어 라벨 | 🟡 라벨 외계어 (Sprint/Discovery/Build/Scale) | P1 |
| **Work** | 4 라이브 제품 (실제 결과물) | 🟢 가장 강력한 증명 ✓ but 위치가 9번째 (너무 늦음) | P0 (위로 이동) |
| **Pricing** | 가격 (한글 듀얼 라벨 ✓) | 🟢 이미 koName 존재 (긴급/진단/MVP/확장) | - (Hero·QA에 노출) |
| **WhatsLearning** | "지금 배우는 것" | 🟡 신뢰 요소 but 후순위 | - |
| **WontDo** | "안 하는 것" | 🟢 신뢰 ✓ 유지 | - |
| **NoAIExperience** | "AI 몰라도 OK" | 🟢 비전문가 핵심 안심 요소 ✓ | P1 (위로 이동) |
| **Founder** | Jayden 소개 | 🟢 신뢰 요소 ✓ | - |
| **FinalCTA** | 마지막 CTA | 🟢 유지 | - |

### 2-3. 핵심 문제 5가지 요약
1. **Hero가 5초 룰 실패** — 영어 키커 + 시적 영어 서브 + 추상 H1 → 비전문가 머리에 그림 안 그려짐
2. **결과물(Work) 너무 늦음** — 9번째 섹션. "그래서 뭐 만들어?"의 답이 한참 후에 나옴
3. **가상 시나리오 부재** — JTBD 핵심인데 페이지 어디에도 없음
4. **자기소개 과잉** — Etymology + Manifesto + WhyThisWorks + Founder = 4개 섹션이 자기 얘기. 비전문가는 결과물 먼저 보고 싶음
5. **패키지명 외계어** — Sprint/Discovery/Build/Scale. Pricing에는 이미 한글 듀얼 라벨 있는데 Hero·QuickAnswer에서 미활용

---

## 3. 재기획안

### 3-1. Hero 재구성 (P0 — 5초 룰 통과 핵심)

**현재**:
```
— A STUDIO directed BY HUMAN, executed BY AI
머릿속 아이디어를 진짜로 만들어드립니다.
Human directs. Machine executes. And the page looks like both.
```

**제안 안 (3안 비교)**:

#### 🅰 안 — "한글 키커 + H1 보존 + 즉시 명확화 서브"
```
키커:  — 비개발자 사장님을 위한 AI 개발 대행
H1:    머릿속 아이디어를 진짜로 만들어드립니다.
       (보존 — 정서적 후크 핵심)
서브:  웹사이트, 앱, 챗봇, 자동화 — 일반 개발사가 3개월 들이는 일을
       AI 도구로 2~3주에. 비용은 1/3.
```
- **장점**: 정서성 100% 보존 + 5초 안에 (1)무엇 (2)누구 답 박힘
- **단점**: 키커가 일반적 (영어 시적 톤 손실)

#### 🅱 안 — "키커는 보존 + H1 직후 박스에 즉시 답"
```
키커:  — A STUDIO directed BY HUMAN, executed BY AI  (보존)
H1:    머릿속 아이디어를 진짜로 만들어드립니다.       (보존)

(H1 직후 신규 박스, 4px amber bar)
■ 풀어 말하면
빵집 카톡 주문 시스템, 공방 작업 의뢰 폼, 학원 출석 관리 앱 —
사업하면서 "있으면 좋겠다" 싶은 디지털 도구를
AI로 2~3주에 만들어드립니다. 비용은 일반 개발사 1/3.
```
- **장점**: Studio Anthem 영어 시적 톤 100% 보존 + 가상 시나리오 즉시 노출
- **단점**: Hero 길어짐 (스크롤 전 노출 영역 ↑)

#### 🅲 안 — "키커만 한글로 + 정서적 H1 + 시적 서브 후순위"
```
키커:  — 비개발자 사장님 · 창업자를 위한 AI 개발 파트너
H1:    머릿속 아이디어를 진짜로 만들어드립니다.       (보존)
서브:  웹사이트 · 앱 · 챗봇 · 자동화. 2~3주, 1/3 비용.
       Human directs. Machine executes. And the page looks like both.
       (한글 명확 + 영어 시적, 두 줄 병기)
```
- **장점**: 한글로 "누구" "무엇" 즉시 박힘 + 영어 시적 톤 살림
- **단점**: 줄이 늘어남 (모바일 위험)

**🟡 추천**: 🅑 안 (키커·H1·서브 100% 보존 + H1 직후 박스 신설). 이유: Studio Anthem 디자인 톤 보존 + JTBD 가상 시나리오 자연 도입 + 직전 세션 Quick Answer 박스 패턴 확장.

### 3-2. 🆕 신규 섹션 — RealScenario (P0 — 가상 시나리오 3개)

**위치**: Hero 직후 또는 QuickAnswer 직후
**목적**: 페르소나가 "내 얘긴데?" 발견 → 5초 안에 자기 인식

**제안 시나리오 3개**:

```markdown
■ 이런 분들이 저희를 찾아오십니다

[01] 김사장님 — 동네 빵집 (45세, 사업 12년차)
"단골 100명이 카톡으로 주문하는데, 빵 종류·픽업 시간·결제가 다 섞여요.
직원이 일일이 정리하다 실수도 잦고. 깔끔한 주문 폼이 있으면 좋겠는데
견적은 800만원이래요."
→ 저희는 카톡 봇 + 주문 폼 + 사장님 관리 화면을 2주에 280만원으로.

[02] 박대표님 — 공방 운영 (52세, 도예가)
"인스타로 작업 의뢰가 오는데, DM이 너무 많아 놓치는 게 부지기수.
홈페이지에 의뢰 폼 하나만 있으면 되는데 개발 견적은 500만원..."
→ 저희는 의뢰 폼 + 견적 자동 응답 + 작업 진행 알림을 1주에 180만원으로.

[03] 이대표님 — 영어 학원 (38세, 창업 2년차)
"학생 30명 출석·숙제 체크를 엑셀로 하다 보니 부모님 문의에 답이 늦어요.
학생용 앱이 있으면 좋겠는데 개발 비용 듣고 포기..."
→ 저희는 출석·숙제·부모 알림 앱을 3주에 350만원으로.

(공통 메시지)
"있으면 좋겠다"는 디지털 도구가 있으신가요?
1시간 인터뷰면 견적이 나옵니다.
[1시간 인터뷰 신청 →]
```

**디자인 톤**: Studio Anthem — paper bg + 1px hairline 카드 3장 + 4px amber 좌측 바 + Fraunces 인용문 톤
**참고**: 현재 WhoThisIsFor 섹션 카드 디자인 재활용 가능 (이미 인용문+해결방안 패턴)

### 3-3. 섹션 순서 재구성 (15개 → 12개로 축소)

**현재 순서**:
```
Hero → QuickAnswer → WhoThisIsFor → Etymology → Manifesto →
WhyThisWorks → Proof → Services → Work → Pricing → WhatsLearning →
WontDo → NoAIExperience → Founder → FinalCTA
```

**제안 새 순서** (P0 변경):
```
1. Hero (재구성)
2. QuickAnswer (강화 — 한글 패키지명 듀얼 라벨)
3. 🆕 RealScenario (가상 시나리오 3개) ← NEW
4. Work (위로 이동, 9번째 → 4번째) ← 가장 강력한 증명을 빨리
5. WhoThisIsFor (3 페르소나 — 보존)
6. NoAIExperience (위로 이동, 13번째 → 6번째) ← 비전문가 안심
7. Services (4 패키지 — 한글 라벨 강화)
8. Pricing (가격 — 한글 듀얼 라벨 이미 있음)
9. WontDo (안 하는 것 — 보존)
10. Founder (Jayden 소개 — 보존)
11. WhatsLearning (학습 중 — 보존, 후순위)
12. FinalCTA

→ /about 페이지로 이동: Etymology, Manifesto, WhyThisWorks
```

**삭제 대상 0건** — 모든 섹션은 가치 있음. 위치만 재배치 (자기소개 3개를 /about으로).

### 3-4. 패키지명 한글 우선 노출 (P1)

**현재 노출**:
- Hero·QuickAnswer: "Sprint 180만원부터 Build · Scale까지" (영어만)
- Pricing: "Sprint." + "긴급 패키지" (한글 듀얼 ✓)

**제안**:
- Hero·QuickAnswer 카피에서 한글 우선 노출:
  - 변경 전: "Sprint 180만원부터 Build · Scale까지"
  - 변경 후: "긴급 패키지 180만원부터 MVP · 확장 패키지까지"
- Pricing은 그대로 유지 (한글+영어 듀얼 — SEO/브랜드 가치 보존)

### 3-5. CTA 카피 강화 (P1)

**현재 CTA**:
- "프로젝트 시작하기"
- "포트폴리오 보기"
- "Start a project →"

**제안 변경**:
- 메인: "프로젝트 시작하기" → "1시간 무료 인터뷰 신청"
  - 이유: "프로젝트 시작"은 결심해야 누르지만, "1시간 인터뷰"는 부담↓ + 페르소나가 두려워하는 "큰 결정" 회피
- 보조: "포트폴리오 보기" → "실제 만든 제품 보기"
  - 이유: "포트폴리오"가 디자이너/개발자 용어. "제품"이 직관적

---

## 4. Step 2 적용 우선순위 (다음 세션)

### 우선 1 (반드시 — Step 2 핵심)
- [ ] **Hero 재구성** (🅑 안 추천) — 키커·H1·서브 보존 + H1 직후 "■ 풀어 말하면" 박스 신설
- [ ] **🆕 RealScenario 섹션 신설** — 가상 시나리오 3개 (빵집 / 공방 / 학원)
- [ ] **섹션 순서 변경** — Work 4번째로 이동, NoAIExperience 6번째로 이동

### 우선 2 (Step 2 또는 Step 3)
- [ ] **패키지명 한글 우선 노출** — Hero·QuickAnswer 카피 한글화
- [ ] **CTA 카피 강화** — "프로젝트 시작" → "1시간 무료 인터뷰 신청"
- [ ] **/about 페이지로 이동** — Etymology, Manifesto, WhyThisWorks 3섹션

### 우선 3 (Step 3 또는 후순위)
- [ ] **Hero 영어 시적 톤 vs 한글 명확성** 최종 균형 결정
- [ ] **모바일 ≤640px 검증** — 새 박스/시나리오 카드 모바일 노출
- [ ] **production curl 검증** — Vercel 배포 후 새 카피 박힘 확인

---

## 5. 절대 보존 사항 (재기획에서도 건드리지 않음)

🟢 **유지**:
- Studio Anthem 디자인 시스템 (Canvas#F5F1E8 / Paper#FAF7F0 / Ink#141414 / Signal amber#FFB800)
- 1px hairline / 4px hard shadow / Fraunces+Geist+Pretendard 폰트
- H1 카피 "머릿속 아이디어를 진짜로 만들어드립니다." (브랜드 보이스 핵심)
- Quick Answer 박스 (직전 세션 추가, AI 인용률 +40%)
- 보안 헤더 5종 / Schema knowsAbout 7개 / canonical 등 SEO 인프라
- /projects 페이지 4 라이브 제품 상세

🔴 **금지**:
- 디자인 시스템 변경 (indigo·violet·purple·blue·teal·glass·blur 그림자 등)
- H1 자체 변경 (직전 세션 교훈 — 정서적 H1은 보존, 박스 추가로 SEO 해결)
- 한 번에 모든 섹션 적용 (점진적 1~2개씩 → 검증 → 다음)

---

## 6. 검토 질문 (Jayden → Step 2 진행 전 결정 필요)

1. **Hero 안 선택**: 🅐 / 🅑 / 🅒 중 어느 것?
   - 🟡 추천: **🅑 안** (키커·H1·서브 100% 보존 + H1 직후 박스)
2. **시나리오 페르소나 3개**: 빵집·공방·학원이 적절? 다른 업종으로?
   - 대안: 카페·꽃집·필라테스·세무사·동네 부동산·소규모 출판사·의류 쇼핑몰 등
3. **섹션 순서 변경**: Work을 9 → 4번째로 이동 OK?
   - 영향: Studio 자기소개(Etymology/Manifesto)가 /about 으로 빠짐
4. **CTA 변경**: "프로젝트 시작" → "1시간 무료 인터뷰 신청" OK?
   - 영향: 부담↓ + 진입 장벽↓ but "프로젝트"라는 결심 단어 사라짐
5. **Step 2 범위**: "우선 1 (Hero + RealScenario + 순서)" 한 세션에 다 / 한 개씩?
   - 🟡 추천: Hero + RealScenario 둘만 한 세션 (1.5~2시간), 순서 변경은 다음 세션

---

## 7. 참고 자료 (Sources)

### 외부 학습
- [Landing Page Design Best Practices 2026 — WE Interactive](https://we-interactive.com/landing-page-design-best-practices-2026-the-performance-driven-guide/)
- [Five-Second Testing Guide — Maze](https://maze.co/collections/user-research/five-second-test/)
- [Value Proposition Examples — Help Scout](https://www.helpscout.com/blog/value-proposition-examples/)
- [Value Proposition 2026 — Shopify](https://www.shopify.com/blog/value-proposition)
- [Jobs to Be Done for Copywriting — Copyhackers](https://copyhackers.com/2014/11/jobs-to-be-done-copywriting/)
- [B2B Buyer Personas — DemandScience](https://demandscience.com/resources/blog/b2b-buyer-personas/)

### 내부 문서
- [BRAND.md (Studio Anthem)](design-references/redesign-2026-studio-anthem/BRAND.md)
- [PRD-v3.2-single-user.md](PRD-v3.2-single-user.md)
- [PROGRESS.md](../PROGRESS.md)

---

## 8. 변경 통계 (이번 세션)

- **코드 변경**: 0줄
- **신규 문서**: 1건 (`docs/landing-rewrite-2026-04-27.md`)
- **외부 학습**: 7회 검색 (5초 룰 / value prop / JTBD / 한국 시장 / B2B 페르소나 등)
- **현재 코드 분석**: page.tsx 섹션 15개 + Pricing.tsx 한글 듀얼 라벨 확인
- **다음 단계**: Jayden 검토 → 검토 질문 5개 답변 → Step 2 코드 적용
