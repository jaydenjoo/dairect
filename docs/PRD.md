# PRD v3.1 — Dairect 통합 플랫폼 (리브랜딩 반영)

> ⚠️ **2026-04-24 末 업데이트**: 현재 유효한 상위 PRD는 **[PRD-v3.2-single-user.md](./PRD-v3.2-single-user.md)** (Jayden 1인 사용 모드, 1차 범위 확정).
> 이 문서(v3.1)는 **Phase 0~4 기능 스펙 원본**으로 대부분 유효하나, Phase 5+ SaaS 전환 관련 섹션은 ⛔ 폐기됨.
> v3.2를 먼저 읽고 이 문서는 상세 스펙 참조용으로 활용할 것.

---

> **프로젝트명:** Dairect (dairect.kr) — 서비스 사이트 + 프리랜서 PM 대시보드
> **포트폴리오 번호:** Portfolio #3 (dairect_si_portfolio.md 기준)
> **버전:** 3.1 (리브랜딩 반영판) · **2026-04-24 업데이트**: Phase 5.5 Billing / SaaS 구독 전면 취소 · **v3.2로 상위 이관**
> **작성일:** 2026-04-16
> **작성자:** Jayden + Claude (Chief PM)
> **보안 등급:** 🟡 부분 보안 (고객 비즈니스 데이터 + 정산 정보)

---

## ⛔ 2026-04-24 PRD 업데이트: SaaS 구독 모델 취소

**Jayden 결정**: Dairect에 SaaS 구독 도입하지 않음.
- `Free / Pro / Team` 플랜 차등 **폐기**
- Stripe / 한국 PG(토스페이먼츠/포트원) 연동 **취소**
- 프리랜서 사용자에게 월 구독료를 받지 않음 (영구 무료 또는 향후 별도 수익 모델 재검토)
- 멤버 수 / AI 일일 호출 한도는 **단일 고정 정책** (전원 동일 규칙 — 남용 방어용 하드리밋만) — `src/lib/plans.ts` 단일 소스
- DB 컬럼(`workspaces.subscription_status` / `stripe_customer_id` / `workspace_settings.plan`)은 **DB에 유지하되 읽지 않음** (재도입 여지 남김)
- 관련 설계 문서: [`docs/archived/billing-mock-design.md`](archived/billing-mock-design.md) (역사 기록)

본 PRD에서 "SaaS 전환" / "Phase 5+ Billing" / "Stripe" 언급은 대부분 **폐기됨**. 아래 본문에 `~~strikethrough~~` + 인라인 ⛔ 표시로 보존. (단, "개인 사용 → SaaS 전환 가능 구조" 같은 **미래 가능성**을 언급하는 추상적 표현은 보존 — Jayden 결정 2 "나중에 여지 남김")

---
> **통합 출처:**
>   - PRD v1.0 (첨부, 2026-04-15): 리드 CRM + 계약서 + 마일스톤 + n8n + 고객 포털
>   - 이전 대화 v2.0: 칸반보드 + 자동 견적 산정
>   - 이전 대화 v3.0: 3종 플로우 통합
>   - 🆕 리브랜딩 시안 (1776334105246_screen.png, 2026-04-16)
>   - 🆕 DESIGN.md ("The Intelligent Sanctuary", 첨부)
>   - dairect_si_portfolio.md: 12개 프로젝트 로드맵 중 #3
>
> **v3.0 → v3.1 주요 변경:**
>   - 🎨 브랜드 리디자인 (웜 골드 → Indigo, 세리프 → DM Sans+Pretendard)
>   - 📝 메시지 톤 전환 ("디렉팅/Vibe Architect" → "아이디어를 진짜로 만들어드립니다")
>   - 🆕 /pricing 가격 페이지 추가
>   - 📐 글로벌 design-system.md → 로컬 DESIGN.md 참조
>   - 🔄 Task 2-8 "랜딩 업그레이드" → "랜딩 리브랜딩" (1일 → 2일)

---

## 문서 구성

```
Part A. PRD 본문 (요구사항 정의)
  1. Executive Summary
  2. 배경 & 문제 정의
  3. 이중 구조 아키텍처
  4. 타겟 사용자 (페르소나)
  5. 목표 & 성공 지표 (Outcome)
  6. 핵심 기능 (MoSCoW)
  7. 만들지 않을 것 (Not Doing)
  8. Phase 구현 계획 (Phase 0~5)
  9. 기술 스택 + 아키텍처
  10. DB 스키마
  11. API 라우트 구조
  12. 폴더 구조
  13. 수익 모델
  14. 리스크 & 제약사항
  15. 완료 기준 (Definition of Done)

Part B. User Flow (사용자 플로우)
Part C. System Flow (시스템 플로우)
Part D. Operational Flow (운영 플로우)
Part E. 자체 검증 체크리스트
```

---

# Part A. PRD 본문

---

## 1. Executive Summary

### 한줄 정의
**dairect.kr**을 이중 구조로 업그레이드한다. 공개 영역은 **"머릿속 아이디어를 진짜로 만들어드립니다"**라는 메시지로 비개발자 클라이언트를 정확히 타겟팅하는 **서비스 사이트**로 리브랜딩하고, 비공개 영역은 **한국 IT 프리랜서가 리드부터 정산까지 전 과정을 관리하는 올인원 PM 대시보드**로 구축한다.

### 배경
기존 dairect.kr은 "AI 디렉팅 철학"을 중심에 둔 에디토리얼 포트폴리오 사이트였다. 하지만 Jayden의 실제 타겟(중소기업 대표, 1인 창업가, 아이디어만 있는 비개발자)과 **메시지 괴리**가 발생했다. "Vibe Architect", "지휘자" 같은 내부 언어는 잠재 고객이 자신을 대입하기 어려운 철학적 표현이었다.

**리브랜딩 방향** (2026-04-16 시안 확정):
1. **톤 전환**: 철학적 에디토리얼 → 친근한 서비스 에이전시 ("Intelligent Sanctuary")
2. **카피 전환**: "디렉팅 시작하기" → "내 아이디어 상담하기"
3. **타겟 명시화**: "개발을 모르셔도, AI를 못 다루셔도 괜찮습니다"
4. **메뉴 구조**: 소개/디렉팅/쇼케이스 → **서비스 / 포트폴리오 / 가격 / 소개**
5. **디자인 시스템**: 웜 골드 + Newsreader 세리프 → **Indigo #4F46E5 + DM Sans + Pretendard**
6. **가격 투명성**: /pricing 페이지 신설로 가격 범위 공개

이와 동시에, 한국 IT 프리랜서 시장의 **수주 이후 워크플로 관리 도구 공백**을 직접 개발 도구로 해결한다. 위시켓(14만+), 이랜서, 크몽은 매칭 플랫폼이고, 글로벌 도구(Bonsai, HoneyBook)는 한국 세금계산서와 착수금/중도금/잔금 구조를 지원하지 않는다.

이 PRD는 두 요구를 하나의 사이트에서 동시에 해결한다:
- **공개 영역**: dairect.kr 리브랜딩 + /projects 포트폴리오 + /pricing 가격 + /demo 라이브 데모
- **비공개 영역**: /dashboard 풀 스택 PM 도구 (개인 사용 → SaaS 전환 가능 구조)

### 핵심 성공 기준
1. Jayden이 신규 SI 프로젝트 1건 이상을 이 대시보드만으로 처음부터 끝까지 관리 완료
2. 프리랜서 행정 업무 시간을 주 10시간 → 3시간으로 단축 (70% 감소)
3. dairect.kr 방문자 중 문의 폼 제출률 **1%+ 달성** (리브랜딩 전 측정 불가 → 전환 가능 상태 확보)
4. /pricing 페이지가 "자주 묻는 질문"을 선제 차단 (가격 문의 감소)
5. SI 수주 미팅에서 "이 도구로 직접 관리합니다"를 라이브 시연하여 신뢰 확보

### 3단계 가치 구조
- **Level 1 (즉시):** 흩어진 프리랜서 행정 업무를 한 곳에서 관리 → 시간 절약
- **Level 2 (1개월~):** 반복 업무(견적서·보고서·청구서) 자동화 → 고객 신뢰도 상승
- **Level 3 (3개월~):** 프로젝트 데이터 축적 → 견적 정확도 향상 + 포트폴리오 자동 반영 + SaaS 전환 기반 마련

---

## 2. 배경 & 문제 정의

### 핵심 고통
> **"프로젝트는 잘 하는데, 그 외 잡무에 하루의 절반을 뺏긴다."**
> **"포트폴리오 사이트에 방문해도 '어떻게 연락해야 하지?'를 못 찾는다."**

### 공개 영역(랜딩) 문제

| # | 문제 | 현재 dairect.kr 상태 |
|---|------|---------------------|
| 1 | SI 문의 동선 부재 | Hero CTA "디렉팅 시작하기" → 뉴스레터 구독으로 연결 |
| 2 | 소셜 프루프 부재 | 완료 프로젝트 수, 고객 후기, 기술 스택 뱃지가 전혀 없음 |
| 3 | 프로젝트 카드 비대칭성 부재 | 4개 카드 모두 동일 크기 (AI 슬롭 패턴) |
| 4 | 라이브 데모 링크 부재 | 만든 제품을 체험할 수 없음 |
| 5 | 포트폴리오 자동 반영 불가 | 새 프로젝트 완료 시 수동으로 사이트 업데이트 필요 |

### 비공개 영역(대시보드) 문제

| # | 문제 | 현재 대안 | 대안의 한계 |
|---|------|----------|-----------|
| 1 | 프로젝트별 진행 현황 파악 불가 | 노션 + 구글 시트 | 수동 업데이트, 고객 공유 불편 |
| 2 | 견적서/계약서 매번 처음부터 작성 | 워드/한글 템플릿 | 항목 누락, 버전 관리 불가, 자동 계산 없음 |
| 3 | 착수금/중도금/잔금 수금 추적 불가 | 엑셀 or 통장 앱 | 프로젝트와 연결 안 됨, 세금계산서 별도 관리 |
| 4 | 견적 금액 산정이 어려움 | 감(感)으로 제시 | 비개발자가 시장가를 모름, 적자 수주 위험 |
| 5 | 고객에게 진행 상황 공유 번거로움 | 카톡/이메일 수동 | 체계적이지 않음, 전문성 낮아 보임 |
| 6 | 완료 프로젝트의 포트폴리오화 수동 | dairect.kr 수동 업데이트 | 까먹음, 최신 상태 유지 어려움 |

### 문제의 비용
- 프리랜서 시급 기준 행정 업무 시간 손실: 주 10시간 × 시급 50,000원 = **월 200만원 기회비용**
- 전문적이지 않은 관리 → 고객 신뢰 하락 → 재계약률 저하
- 정산 누락/지연 → 현금흐름 악화
- 랜딩 전환 동선 부재 → 잠재 고객 유실

---

## 3. 이중 구조 아키텍처

dairect.kr을 하나의 도메인 안에서 두 영역으로 분리한다:

```
dairect.kr
│
├── 공개 영역 (누구나 접근)
│   ├── / ───────────────── 랜딩페이지 (리브랜딩)
│   ├── /services ────────── 서비스 소개 (Nav: "서비스")
│   ├── /projects ────────── 포트폴리오 쇼케이스 (Nav: "포트폴리오", 자동 반영)
│   ├── /pricing ─────────── 가격 안내 🆕 (Nav: "가격")
│   ├── /about ───────────── 소개 (Nav: "소개")
│   ├── /demo ────────────── 대시보드 데모 (샘플 데이터, 읽기 전용)
│   ├── /login ───────────── 로그인 (Google OAuth)
│   ├── /portal/[token] ──── 고객 포털 (Phase 5, 토큰 기반 접근)
│   ├── /terms ───────────── 이용약관 (기존)
│   └── /privacy ─────────── 개인정보처리방침 (기존)
│
└── 비공개 영역 (로그인 필요)
    └── /dashboard
        ├── / ─────────────── 메인 Overview (KPI + 차트 + AI 브리핑)
        ├── /projects ────── 프로젝트 관리 (리스트 + 칸반)
        ├── /projects/[id] ─ 프로젝트 상세 (개요/마일스톤/견적/계약/정산/메모)
        ├── /clients ─────── 고객 CRM
        ├── /clients/[id] ── 고객 상세
        ├── /estimates ───── 견적서 목록
        ├── /estimates/new ─ 견적서 생성 (수동/자동산정/AI초안)
        ├── /estimates/[id]  견적서 상세/수정
        ├── /contracts ───── 계약서 목록
        ├── /contracts/[id]  계약서 상세
        ├── /invoices ────── 인보이스(정산) 관리
        ├── /leads ────────── 리드 CRM (Phase 3)
        └── /settings ────── 사업자 정보 + 환경설정
```

### 🎨 디자인 시스템 참조 (v3.1 신규)

**⚠️ 중요:** 글로벌 `design-system.md`는 **이 프로젝트에 적용하지 않는다.**
대신 아래 로컬 경로의 파일들을 단일 진실 공급원(Single Source of Truth)으로 사용한다:

```
/Users/jayden/project/dairect/docs/design-references/redesign-2026/
├── DESIGN.md                  ← "The Intelligent Sanctuary" 철학 + 토큰
├── (랜딩 시안 이미지)
└── (기타 참조 파일)
```

**디자인 철학 요약** (DESIGN.md 기반):
- **North Star**: "The Guided Sanctuary" — 고밀도 AI 도구의 소란함을 거부하고, 조용하고 신중한 에디토리얼 공간 창출
- **No-Line Rule**: 1px 솔리드 테두리 사용 금지. 경계는 배경색 톤 전환으로만 표현
- **Surface Hierarchy**: 3단계 레이어 (Base → Container Low → Container Lowest)
- **Tonal Layering**: 선이 아닌 "빛"으로 깊이 표현
- **Typography**:
  - 영문: DM Sans / 한글: Pretendard
  - 한글 헤드라인은 영문 대비 **20-30% 작게**
  - 한글 대문자 절대 금지, wide letter-spacing 금지
  - 한글 본문은 `word-break: keep-all`, `line-height: 1.8`
- **Primary Color**: `#4F46E5` (Indigo) — Soul Gradient 적용 가능
- **Surface**: `#F9F9F7` (오프화이트, 프리미엄 종이 질감)
- **Glassmorphism**: Nav/오버레이는 70% opacity + 24px backdrop blur
- **Bento Cards**: 12px radius, 비대칭 aspect ratio (1:1, 2:1, 1:2)
- **금지**: 순수 검정(#000), 1px 솔리드 테두리, 대문자 헤딩, 단층 drop shadow

### 영역 간 데이터 연결 원칙

```
[대시보드]                                    [공개 영역]
프로젝트 (is_public=true, 공개용 별칭)  ───→  /projects 자동 노출
프로젝트 (모든 데이터)                    ───→  /demo 샘플로 가공 표시
user_settings (사업자 정보)              ───→  견적서/계약서 PDF에 자동 반영
user_settings (feature_presets + 일단가)  ───→  /pricing 페이지 "예상 견적기" 🆕
활동 로그                                ───→  대시보드 타임라인
```

**공개 시 노출 정책:**
- ✅ 공개: 프로젝트명(또는 공개용 별칭), 한줄 설명, 기술 태그, 기간, 상태, 스크린샷
- ❌ 비공개: 금액, 고객명/회사명, 견적서, 수금 정보, 내부 메모

---

## 4. 타겟 사용자 (페르소나)

### Primary: 현우 (= Jayden 본인)

| 항목 | 내용 |
|------|------|
| 이름 | 김현우 (34세) |
| 역할 | 1인 IT 프리랜서, Vibe Architect |
| 방식 | AI 바이브코딩으로 웹/앱 개발 (Claude Code + n8n) |
| 팀 규모 | 1인 (필요 시 하청 프리랜서 1~2명) |
| 연 프로젝트 | 8~15건 (소규모 300만원 ~ 대규모 3,000만원) |
| 기술 수준 | 비개발자이지만 AI 도구 능숙 |
| 최대 고통 | "코딩은 AI가 해주는데, 견적서·계약서·보고서·세금은 내가 직접 해야 한다" |
| 견적 고민 | "얼마를 불러야 적정한지 모르겠다" |
| 돈 낼 의향 | 월 5~10만원 (자신의 시간 절약 대비 저렴) |
| 사용 빈도 | 매일 (프로젝트 진행 중) |

### Secondary: 수진 (SaaS 전환 후 타겟, Phase 4+)

| 항목 | 내용 |
|------|------|
| 이름 | 박수진 (29세) |
| 역할 | 2~3인 소규모 개발 에이전시 대표 |
| 팀 규모 | 본인 + 프리랜서 디자이너 1명 + 프리랜서 백엔드 1명 |
| 최대 고통 | "프로젝트 3개가 동시에 돌아가는데 누가 뭘 하고 있는지 파악이 안 된다" |
| 돈 낼 의향 | 월 10~20만원 |

### Tertiary: 랜딩 방문자 (SI 잠재 고객)

| 항목 | 내용 |
|------|------|
| 역할 | 중소기업 대표, 마케팅 팀장, 스타트업 CTO |
| 유입 경로 | 검색("AI 바이브코딩 개발자"), SNS 소개, 위시켓 프로필 링크 |
| 최대 고통 | "AI로 개발한다는 사람들은 많은데, 진짜 만드는 사람을 어떻게 찾지?" |
| 판단 기준 | 실제 결과물(라이브 데모), 실제 사용자(Jayden 본인이 씀), 구체적 수치 |

---

## 5. 목표 & 성공 지표 (Outcome)

### 비즈니스 Outcome (Jayden 관점)

| 지표 | 현재 | 목표 (3개월) | 측정 방법 |
|------|------|-------------|----------|
| 행정 업무 시간 | 주 10시간 | 주 3시간 | 대시보드 자체 시간 로그 |
| 견적서 작성 시간 | 2시간/건 | 15분/건 | 견적서 생성~완료 시간 |
| 수금 누락률 | ⚠️ 추정 10% | 0% | 미수금 알림 자동화 |
| 고객 재계약률 | ⚠️ 추정 30% | 50% | CRM 데이터 |
| SI 수주 건수 | — | +2건 (포트폴리오 효과) | 프로젝트 DB |

### 사용자 Outcome (대시보드)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 일일 활성 사용 (DAU) | Jayden 매일 접속 | 로그인 로그 |
| 핵심 가치 도달 시간 | 첫 프로젝트 등록까지 5분 | 온보딩 퍼널 |
| 기능 채택률 | 견적서 기능 100% 사용 | 기능별 사용 로그 |
| AI 브리핑 만족도 | 5점 중 4점+ | 주간 피드백 |

### 방문자 Outcome (랜딩)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 문의 폼 제출률 | 방문자의 1% | 폼 제출 이벤트 |
| /projects 이동률 | 방문자의 15% | GA/Vercel Analytics |
| /demo 체험률 | 방문자의 5% | /demo 페이지뷰 |
| 평균 체류 시간 | 2분+ | Vercel Analytics |

### 포트폴리오 Outcome

| 지표 | 목표 | 의미 |
|------|------|------|
| 실사용 증거 | Jayden이 3개월+ 직접 사용 | "만든 사람이 쓰는 제품" 증명 |
| 기술력 시연 | 풀스택 + AI + 자동화 통합 | SI 수주 시 역량 증명 |
| 포트폴리오 자동 반영 | 완료 프로젝트가 /projects에 자동 게시 | 유지보수 제로 |

### AI-Specific Outcome

| 지표 | 목표 | 비고 |
|------|------|------|
| AI 견적 초안 정확도 | 사용자 수정 30% 이내 | Phase 3 측정 |
| AI 주간 보고서 채택률 | 80%+ (거의 그대로 고객 발송) | Phase 3 측정 |
| AI 환각률 | 2% 이하 | 입력되지 않은 기능을 견적에 포함하지 않음 |
| AI 응답 시간 | 10초 이내 | Claude API 스트리밍 |

---

## 6. 핵심 기능 (MoSCoW)

### 📘 범례
- 🔵 [공개] = 랜딩 영역 기능
- 🟠 [비공개] = 대시보드 영역 기능
- 🔗 [연결] = 공개+비공개 연동 기능

---

### Must Have — 이것 없으면 제품이 아님

#### 🔵 M-P1. 랜딩페이지 리브랜딩 (v3.1 전면 개편)

**🎯 리브랜딩 목표**
에디토리얼 포트폴리오 → **비개발자 클라이언트용 서비스 에이전시 사이트**

**⛔ v3.0 "기존 톤 유지" 방침 폐기**
시안 7장 확정(2026-04-16)으로 전면 리디자인. Newsreader 세리프 + 웜 골드 톤은 완전히 제거.

**📐 디자인 시스템 (DESIGN.md 필수 준수)**
- **컬러**: Primary `#4F46E5` (Indigo), Surface `#F9F9F7`, Dark `#111827` (순수 검정 금지)
- **폰트**: 영문 DM Sans, 한글 Pretendard Variable, 코드/뱃지 JetBrains Mono
- **레이아웃 원칙**: Bento Grid 비대칭, No-Line Rule, Tonal Layering, Glassmorphism Nav
- **참조 경로**: `/Users/jayden/project/dairect/docs/design-references/redesign-2026/` (HTML + 이미지 7장)

**📄 랜딩페이지 섹션 구성** (시안 7장 기준 합본)

**[Section 1] Nav (고정 상단, Glassmorphism)**
- 좌측 로고: `dairect` (소문자, Indigo #4F46E5)
- 중앙 메뉴: **서비스 / 포트폴리오 / 가격 / 소개** (한글 통일)
- 우측 CTA: `문의하기 →` Primary 버튼 (Indigo, Soul Gradient)
- 스크롤 시: 70% opacity + 24px backdrop blur

**[Section 2] Hero** (시안 이미지 1, 7)
- 좌측:
  - 🏷️ 뱃지 (JetBrains Mono, 연보라 pill): `AI-Powered Development`
  - 📝 헤드라인: **"머릿속 아이디어를 / 진짜로 만들어드립니다"** ("진짜로" 부분 Indigo 강조)
  - 💬 부제 (2줄):
    - "개발을 모르셔도, AI를 못 다루셔도 괜찮습니다."
    - "아이디어만 말씀해주세요. 나머지는 저희가 합니다."
  - 🎯 CTA 쌍:
    - Primary: `내 아이디어 상담하기 →` (Indigo, Soul Gradient)
    - Ghost: `포트폴리오 보기`
- 우측: 3D 기기 목업 (다크 노트북 + 폰 UI, `PROJECT_ALPHA_V2`)
- 하단 스탯 바: **10+ 프로젝트 완료** · **2주 평균 전달 기간** · **98% 고객 만족도**
  - No-Line Rule: border 없이 여백으로 구분
  - 숫자: Indigo Bold (DM Sans), 라벨: gray-700

**[Section 3] 문제 정의** (시안 이미지 2 기반)
- 소제목 (상단 가볍게): `이런 경험, 있으시죠?`
- Bento Grid 3카드 (비대칭: 2×1 + 1×1 + 1×1):
  - **견적서 보고 놀란 경험** 🧾 "앱 하나 만드는데 500만 원? 아이디어 검증도 전에 그 돈을 쓸 순 없는데..."
  - **AI 도구 앞에서 멍해진 경험** 🤯 "ChatGPT, Cursor... 다 좋다는데, 어디서부터 시작해야 하는지 모르겠다."
  - **아이디어만 쌓이는 서랍** 💡 "설명하면 다들 '좋은데?' 하고 끝. 아무도 만들어주지 않는다."
- 우측 하단 인용 (연한 이탤릭):
  > "창업자의 90%는 실행력의 부재로 멈춥니다. dairect는 그 멈춤을 해결합니다."
- 섹션 하단 헤드라인: **"그 서랍을 열어드리겠습니다."** (큰 크기, 중앙 정렬)

**[Section 4] 프로세스** (시안 이미지 1 기반)
- 제목: `이렇게 진행됩니다`
- 부제: "복잡한 코드 고민은 저희가 맡겠습니다. 당신의 아이디어가 현실이 되는 4단계 프로세스를 확인하세요."
- 4단계 카드 (가로 4컬럼, 미세 도트 패턴 배경):
  - **01 심층 상담** 💬 "해결하고자 하는 문제와 비즈니스 목표를 명확히 정의하기 위한 전문가 미팅을 진행합니다."
  - **02 전략 설계** 🎯 "수집된 정보를 바탕으로 최적의 기술 스택과 아키텍처, 개발 로드맵을 설계하여 제안합니다."
  - **03 맞춤 개발** 🔧 "엄격한 코드 퀄리티 기준을 준수하며, 점진적인 배포를 통해 실시간 피드백을 반영하여 개발합니다."
  - **04 완성 및 이관** 🫴 "철저한 QA를 거친 최종 결과물을 안정적으로 배포하고, 상세 가이드와 함께 소유권을 전달합니다."
- 각 카드: 상단 큰 숫자 (흐린 gray-300) + 원형 아이콘 박스 (연보라 배경)
- 중앙 CTA 버튼: `내 아이디어도 가능할까? →` (Indigo Primary)
- 하단 Bento 2카드 (2:1 비율):
  - **AI 가이드가 함께하는 여정** (흰 배경, 2컬럼): "모든 단계에서 AI 기반 분석 리포트를 제공하여, 현재 진행 상황과 미래의 확장성을 투명하게 공개합니다."
  - **신뢰의 코드 품질** ✔️ (보라 배경, 1컬럼): "100% 테스트 커버리지를 목표로 하며 상시 코드 리뷰가 진행됩니다."

**[Section 5] 포트폴리오 프리뷰** (시안 이미지 4 축약)
- `/projects`의 공개 프로젝트 Top 3~4개 미리보기
- Bento Grid 비대칭 레이아웃 재사용
- "전체 포트폴리오 보기 →" 링크 → `/projects`

**[Section 6] 가격 프리뷰** (시안 이미지 3 축약)
- 3패키지 간략 카드 + "자세히 보기" → `/pricing`

**[Section 7] 하단 CTA** (시안 이미지 1, 7)
- 카드형 (Surface Container Low 배경)
- 좌측: "**무엇을 고민하고 계신가요?**" + "지금 바로 전문가와 상의하고 런칭 로드맵을 받아보세요."
- 우측: `💬 무료 상담 신청하기` Dark 버튼 (gray-900 #111827 배경, 흰 텍스트)

**[Section 8] Footer** (시안 이미지 5)
- 다크 배경 (#111827)
- 좌측:
  - `dairect` 로고 (흰색)
  - **슬로건 유지**: "코드는 AI가, 방향은 내가" (브랜드 DNA 보존)
- 중앙 메뉴: 서비스 소개 / 포트폴리오 / 가격 안내 / 개인정보처리방침
- 우측: 💬 카카오톡 상담 / ✉️ 이메일: hello@dairect.kr
- 하단 바: © 2026 dairect. All rights reserved. / 사업자등록번호: 000-00-00000 / 대표: 주재이드

---

**🔄 v3.0 대비 변경 요약**

| 항목 | v3.0 (기존 유지) | v3.1 (리브랜딩) |
|------|-----------------|----------------|
| 로고 | `DAIRECT` 대문자+세리프 | `dairect` 소문자+DM Sans |
| Hero 헤드라인 | "코드는 AI가, 방향은 내가" | "머릿속 아이디어를 진짜로 만들어드립니다" |
| 브랜드 슬로건 | Hero 메인 | **Footer 유지** (DNA 보존) |
| Primary CTA | "프로젝트 의뢰하기 →" | "내 아이디어 상담하기 →" |
| 메인 컬러 | 웜 골드 (#b8860b) | Indigo (#4F46E5) |
| 폰트 | Newsreader + Manrope + Noto | DM Sans + Pretendard Variable |
| 메뉴 구성 | 소개/디렉팅/쇼케이스/프로덕트 | 서비스 / 포트폴리오 / **가격** / 소개 |
| 하단 CTA 버튼 | Primary 컬러 | Dark (#111827) — 차분한 대비 |
| 메타포 | 지휘자 (Conductor) | Sanctuary (차분한 공간) |
| 대상 언어 | "Vibe Architect" (메인 노출) | About에서만 사용 |
| 그림자 | 단층 shadow | Ambient Tonal (다층 + 틴트) |
| 테두리 | 일반 1px border | No-Line Rule (배경 톤 전환만) |

---

#### 🔵 M-P2. /projects 포트폴리오 페이지 (시안 이미지 4)

**페이지 구성:**
- 제목: **"이런 걸 만듭니다"**
- 부제: "실제 고객 프로젝트 결과물입니다"
- Bento Grid 비대칭 레이아웃:
  - **Featured 카드 (2×2)**: 가장 중요한 프로젝트 (예: Chatsio)
    - 대시보드 스크린샷 (다크 배경 + 보라 차트)
    - 프로젝트명 + 서브타이틀
    - 기술 태그 pill (Next.js, Supabase, Claude API)
    - 소요 기간 뱃지 (예: "2주")
  - **일반 카드 (1×1, 2~3개)**:
    - Findably (AI 마케팅 진단 도구) + 차트 이미지 + [Next.js] + "10일"
    - AutoVox (AI 음성 자동화) + 음성 파형 이미지 + [n8n] + "1주"
  - **가로 넓은 카드 (2×1)**: 추가 프로젝트
    - PM Dashboard (프리랜서 프로젝트 관리) + 대시보드 미리보기 + [Next.js][Supabase][n8n] + "2주"

**데이터 소스:**
- `projects` 테이블에서 `is_public=true AND deleted_at IS NULL`인 레코드
- 공개 정보: `public_alias`, `public_description`, `public_tags`, `public_screenshot_url`, `public_live_url`
- 비공개 정보: 금액, 고객명, 견적서, 수금 — 절대 노출 금지

**하단 CTA 섹션 (시안 이미지 4):**
- 보라 배경 큰 박스
- 제목: "**다음 프로젝트의 주인공이 되어보세요**"
- 부제: "당신의 아이디어를 고퀄리티 결과물로 실현해 드립니다."
- CTA: `무료 상담 신청하기` (흰색 배경, Indigo 텍스트)

**Empty State:**
- 공개 프로젝트 0개일 때: "곧 프로젝트가 공개됩니다" + 대시보드 /demo 링크

---

#### 🔵 M-P3. /pricing 가격 페이지 🆕 (시안 이미지 3)

**페이지 구성:**
- 제목: **"합리적인 비용, 확실한 결과"**
- 부제: "아이디어의 크기에 맞는 최적의 플랜을 제안합니다. 복잡한 개발 과정을 투명하고 명확한 비용 체계로 경험하세요."

**3패키지 카드 (비대칭, 중앙 강조)**

| 패키지 | 가격 | 기간 | 포함 내용 | CTA |
|--------|------|------|----------|-----|
| **진단 패키지** | 30만원~ | 3-5일 | 아이디어 분석 보고서 / 핵심 기능 정의 / 기술 스택 추천 / 개발 로드맵 | 자세히 알아보기 |
| **MVP 패키지** ⭐ | 100만원~ | 2-3주 | 진단 패키지 포함 / MVP 개발 + 배포 / 2주 무상 수정 / 사용 가이드 | **상담 신청하기 →** |
| **확장 패키지** | 300만원~ | 4-8주 | MVP 패키지 포함 / 추가 기능 개발 / 도메인 + 배포 / 운영 가이드 | 자세히 알아보기 |

**디자인 규칙 (시안 준수):**
- 중앙 카드(MVP): 상단에 `가장 많이 선택해요` 뱃지 + Indigo 보더 강조 + Primary CTA 버튼
- 좌/우 카드: 일반 Surface + Ghost 스타일 버튼
- 각 카드: 가격(큰 크기, Indigo) + 기간 뱃지 + 체크리스트(✓)
- No-Line Rule 유지 (카드 구분은 shadow + 배경 톤만)

**하단 안내 문구:**
- "정확한 금액은 프로젝트 범위에 따라 달라집니다. 편하게 문의해주세요."

**Phase 배치:**
- Phase 2 Task 2-8에 포함 (랜딩 리브랜딩과 함께 구현)
- 향후 (Phase 3~4) 대시보드의 견적 자동 산정기와 연동 가능 (설정 > 일단가 + 프리셋 기반)

---

#### 🔵 M-P4. /about 소개 페이지 🆕 (시안 이미지 6)

**페이지 구성:**

**[Hero - 다크 섹션]** (gray-900 #111827 배경)
- 좌측: Jayden 포트레이트 사진 (흑백 or 세피아 톤, 정방형 카드)
- 우측:
  - **Jayden** (큰 이름, 흰색 DM Sans Bold)
  - **Vibe Architect · dairect 대표** (서브타이틀)
  - 인용 (연한 이탤릭, 좌측 Indigo 바):
    > "AI는 자동차입니다. 운전을 못해도 괜찮아요. 택시를 타면 되니까요."
  - 본문: "코드는 AI가 쓰고, 방향은 제가 잡습니다. 고객님의 아이디어가 세상에 나올 수 있도록, 가장 작고 확실한 첫 걸음을 함께합니다."
  - 2개 뱃지:
    - ✓ `EXPERT GUIDANCE`
    - ⚡ `FAST DELIVERY`

**[Contact Form - 연보라 섹션]**
- 제목: **"내 아이디어, 만들 수 있을까?"**
- 부제: "편하게 말씀해주세요. 24시간 내 연락드립니다."
- 폼 필드:
  - **이름** * (텍스트)
  - **연락처** * (전화번호 또는 이메일)
  - **아이디어 한줄 요약** (50자 내외, "어떤 서비스를 구상 중이신가요?" 플레이스홀더)
  - **상세 설명** (텍스트영역, "세부 내용을 적어주시면 더 정확한 상담이 가능합니다.")
  - **예산 범위** (라디오 4개, 2×2 그리드):
    - 100만 원 미만
    - 100-300만원
    - 300만원 이상
    - 잘 모르겠음
  - **희망 일정** (라디오 3개, 1×3 그리드):
    - 1개월 내
    - 1-3개월
    - 여유 있음
- 제출 버튼: `문의 보내기 →` (Indigo Primary, Soul Gradient)
- 하단 문구: "BY SUBMITTING THIS FORM, YOU AGREE TO OUR [PRIVACY POLICY]"
- 제출 후: 토스트 "문의가 접수되었습니다. 24시간 내 연락드리겠습니다."

**DB 연동:**
- `inquiries` 테이블 INSERT (budget_range, schedule 필드 추가 필요)
- Phase 3: `leads` 자동 생성 (source='landing_form')

---

#### 🔵 M-P5. /demo 대시보드 데모 (v3.0 유지)
- 비로그인 접근 가능
- 상단 배너: "데모 모드 — 샘플 데이터입니다. 실제 사용 → [로그인]"
- 모든 페이지 열람 가능 (대시보드, 프로젝트, 고객, 견적, 정산, 설정)
- 모든 CRUD 버튼 비활성 (클릭 시 토스트: "데모 모드에서는 수정할 수 없습니다")
- 샘플 데이터: 프로젝트 5개(각 상태 1개), 고객 3개, 견적서 3개, 6개월 매출, 수금 타임라인

#### 🟠 M-D1. 프로젝트 파이프라인 관리
- 프로젝트 CRUD (생성, 조회, 수정, 소프트 삭제)
- 상태 관리: `리드 → 상담 → 견적 → 계약 → 진행 → 검수 → 완료 → 하자보수 → 종료`
- 추가 상태: `실패` (견적 거절), `취소` (중도 취소)
- **두 가지 뷰:**
  - 리스트 뷰 (테이블 형태, 필터/정렬)
  - 칸반 뷰 (컬럼별 카드)
- Phase 1: 드롭다운으로 상태 변경
- Phase 2+: 칸반 드래그 앤 드롭 활성화
- 프로젝트 상세 페이지: 탭 구조 (개요 / 마일스톤 / 견적 / 계약 / 정산 / 메모)

#### 🟠 M-D2. 마일스톤 관리
- 프로젝트별 마일스톤 CRUD
- 체크리스트 형태 (체크/미체크)
- 전체 진행률 자동 계산 (완료/전체 %)
- 마일스톤별 기한 설정 + 다가오는 마일스톤 대시보드 표시

#### 🟠 M-D3. 고객(Client) CRM
- 고객 CRUD
- 고객별 프로젝트 히스토리 연결
- 고객 정보: 회사명, 담당자명, 이메일, 전화, 사업자번호, 주소, 메모
- 고객별 총 거래 금액 자동 집계
- 소통 메모 타임라인 (날짜별 커뮤니케이션 기록)

#### 🟠 M-D4. 견적서 생성기 (3가지 모드)
- **모드 1: 수동 입력** — 항목 직접 추가 (기능명, Man/Day, 단가, 수량)
- **모드 2: 자동 산정** — 기능 체크리스트에서 선택 → 자동 계산
  - 기본 프리셋 25종 (인증/프론트/백엔드/AI/결제/연동/기타 카테고리)
  - 카테고리별 소요일 + 난이도 계수 사전 설정
  - 설정 페이지에서 프리셋 CRUD 가능
  - 계산 공식: `소요일 × 일 단가 × 난이도 계수`
- **모드 3: AI 초안** — 요구사항 텍스트 입력 → Claude API가 항목 분해 (Phase 3)
- 자동 계산: 소계 / 공급가액 / 부가세(10%) / 총액
- 결제 분할: 착수금/중도금/잔금 비율 설정 (기본 30/40/30, 조정 가능)
- 견적서 번호 자동 채번 (EST-2026-001)
- 버전 관리 (수정 시 v2 자동 생성, 이전 버전 보존)
- 견적 템플릿 저장/불러오기
- 유효기한 설정 (기본 작성일 + 30일)

#### 🟠 M-D5. 견적서 PDF 생성 + 이메일 발송
- 한국식 견적서 양식 (공급자 / 공급받는자 / 항목표 / 금액 / 결제조건 / 유효기한)
- Dairect 로고 + 브랜드 디자인
- PDF 다운로드 + mailto: 이메일 발송 링크
- 발송 이력 기록

#### 🟠 M-D6. 계약서 생성기
- 표준 SI 계약서 템플릿 (한국 소프트웨어 용역 계약서 기반)
- 변수 자동 매핑: 프로젝트 정보 + 고객 정보 + 견적 금액
- 편집 가능 영역: 하자보수 기간(기본 3개월), 지적재산권(기본 고객), 손해배상 한도
- 계약서 PDF 생성
- 계약 상태 추적: `초안 → 발송 → 서명완료 → 보관`
- **전자서명은 모두싸인 링크 연동만** (자체 구현 X)

#### 🟠 M-D7. 정산 관리
- 프로젝트별 수금 현황 (착수금/중도금/잔금)
- 각 단계별 상태: `미청구 → 청구(인보이스 발행) → 입금완료`
- 인보이스(청구서) 자동 생성 (견적서 기반)
- 인보이스 PDF (공급자/공급받는자/공급가액/부가세/합계)
- 세금계산서 발행 도우미: 필요 정보 표시 + 홈택스 바로가기 링크
- 입금 확인 시 실제 수금일 자동 기록
- 모든 수금 완료 → 프로젝트 자동으로 "정산완료" 이동 (옵션)

#### 🟠 M-D8. 수금 현황 페이지
- KPI 카드 3개: 총 계약액 / 수금 완료 / 미수금 (경고)
- 프로젝트별 수금 타임라인 (프로그레스 바)
  - ● 수금 완료 / ○ 미수금 / 🔴 연체
- 연체 경고 (D+1 이상): error 하이라이트
- 미수금 알림 (D+7, D+14, D+30): 자동 배지

#### 🟠 M-D9. KPI 대시보드 (홈 화면)
- KPI 카드 4개: 이번달 매출 / 미수금 / 진행 중 프로젝트 / 완료 프로젝트
- 월별 매출 차트 (Bar, 최근 6개월)
- 고객별 매출 파이 차트
- 이번 주 수금 예정 리스트
- 최근 활동 타임라인 (최근 5건)
- 다가오는 마일스톤/납기 3건

#### 🔗 M-C1. 인증 + 라우팅
- Supabase Auth (Google OAuth)
- 인증 미들웨어: /dashboard/* 보호
- /demo는 인증 없이 접근
- 첫 로그인 시 user_settings 기본값 자동 생성

#### 🔗 M-C2. 설정 페이지
- 회사 정보: 상호, 대표자, 사업자등록번호, 주소, 연락처, 이메일, 입금 계좌 (견적서 자동 반영)
- 견적서 기본값: 번호 접두어(EST), 일 단가(700,000원 기본), 기본 수금 비율(30/40/30)
- 기능 프리셋 관리: 자동 산정용 기능 목록 CRUD

---

### Should Have — Phase 2~3에서 추가

#### 🟠 S-D1. 리드 CRM (Phase 3)
- 리드 소스 추적: 위시켓 / 크몽 / 소개 / 직접 문의 / 랜딩 폼
- 리드 상태: `신규 → 상담예정 → 상담완료 → 견적발송 → 계약 → 실패`
- 리드 → 프로젝트 전환 (상태가 "계약"이 되면 프로젝트 자동 생성)
- 전환율 분석 (소스별, 월별)
- 랜딩 문의 폼 제출 시 → 리드 자동 생성

#### 🟠 S-D2. 칸반 드래그 앤 드롭 (Phase 2)
- @dnd-kit 기반
- 카드 드래그 → 컬럼 이동 = 상태 변경
- 모바일에서는 드롭다운 대체

#### 🟠 S-D3. AI 견적 초안 생성 (Phase 3)
- 입력: 고객 요구사항 자유 텍스트
- 출력: 견적서 항목 자동 분해 (기능명 + Man/Day + 난이도)
- Claude Sonnet 4.6 API
- 생성 항목을 견적서 폼에 자동 입력 → 사용자 검토/수정 필수

#### 🟠 S-D4. AI 주간 보고서 생성 (Phase 3)
- 입력: 프로젝트 마일스톤 현황 + 최근 변경사항
- 출력: 고객용 주간 보고서 초안 (마크다운 → PDF)
- 포함: 이번 주 완료, 다음 주 계획, 이슈/리스크
- **반드시 사용자 검토 후 고객 발송** (AI 직접 발송 X)

#### 🟠 S-D5. AI 주간 브리핑 (Phase 3)
- 대시보드 홈 상단에 표시
- 이번 주 수금 예정, 미수금 경고, 완료 임박 프로젝트, "이번 주 집중할 것" 3가지
- 주 1회 자동 생성, [새로고침] 버튼으로 재생성

#### 🟠 S-D6. n8n 자동화 연동 (Phase 3)
- Supabase Database Webhook 트리거
- **W1**: 프로젝트 상태 변경 시 → Slack 알림
- **W2**: 미수금 D+7 → 리마인더 이메일 자동 발송
- **W3**: 매주 금요일 17:00 → AI 주간 보고서 초안 이메일 발송
- **W4**: 프로젝트 완료 시 → 만족도 설문 발송

#### 🔗 S-C1. 포트폴리오 자동 반영 (Phase 2)
- 프로젝트 상세에 "공개" 토글
- 토글 ON → /projects에 자동 게시
- 공개용 별칭, 공개용 설명, 기술 태그 별도 입력
- 스크린샷 업로드 (Supabase Storage)

---

### Could Have — Phase 4~5 리소스 여유 시

#### 🔵 C-P1. 고객 포털 (Phase 5)
- /portal/[token] 라우트 (토큰 기반 접근, 인증 불필요)
- 고객이 볼 수 있는 정보:
  - 프로젝트 진행률 (마일스톤)
  - 납품물 링크
  - 발행된 인보이스 (본인 프로젝트 건만)
- 피드백 폼 (검수 의견, 수정 요청)
- 고객이 못 보는 정보: 수익 분석, 다른 프로젝트, 내부 메모
- 토큰 만료 (1년) 또는 프로젝트 종료 시 자동 만료

#### 🟠 C-D1. 팀원 관리 멀티유저 (Phase 5, SaaS 전환 시)
- 하청 프리랜서 초대 + 역할 배정
- 팀원별 태스크 할당
- RBAC: admin / member

#### 🟠 C-D2. 경비 관리 (Phase 4)
- 프로젝트별 경비 기록 (인프라, 도메인, API 비용)
- 카테고리별 분류
- 부가세 매입세액 공제 대상 자동 표시

#### 🟠 C-D3. 시간 추적 (Phase 4)
- 프로젝트별 작업 시간 기록
- 실제 Man/Day vs 견적 Man/Day 비교

#### 🟠 C-D4. PWA 지원 (Phase 4)
- 모바일 "홈 화면에 추가" 설치
- 오프라인 읽기 전용 지원

---

## 7. 만들지 않을 것 (Not Doing)

> AI 코딩 에이전트는 생략된 것을 추론할 수 없으므로, 경계를 명시적으로 서술한다.

### 절대 만들지 않을 것 (전 Phase)

#### 결제/금융
- ❌ **결제 PG 직접 연동은 구현하지 않는다** — 고객이 대시보드에서 직접 결제하는 기능 없음. 정산은 인보이스 발행 + 계좌이체 확인 방식
- ❌ **환율/다통화는 지원하지 않는다** — KRW 단일
- ❌ **홈택스 API 직접 연동은 구현하지 않는다** — 세금계산서 발행에 필요한 정보 표시 + 홈택스 바로가기 링크만 제공
- ❌ **회계/세무 자동 신고 기능은 구현하지 않는다** — 필요 정보 표시까지만

#### 플랫폼/언어
- ❌ **모바일 네이티브 앱은 개발하지 않는다** — 반응형 웹 + PWA(Phase 4)로 대응
- ❌ **다국어(영어 등)는 지원하지 않는다** — 한국어 전용
- ❌ **데스크탑 앱(Electron 등)은 만들지 않는다** — 웹만

#### AI
- ❌ **AI 모델 파인튜닝은 하지 않는다** — Claude API 프롬프트 엔지니어링만
- ❌ **AI가 생성한 내용을 사용자 확인 없이 고객에게 발송하지 않는다** — 반드시 사용자 검토 단계 거침
- ❌ **음성 입력/STT는 Phase 1~3에서 구현하지 않는다** — 포트폴리오 #1 "회의록 자동화"와 혼선 방지

#### 랜딩/브랜드 관련 (v3.1 업데이트)
- ❌ **글로벌 `design-system.md`는 이 프로젝트에 적용하지 않는다** — 로컬 `/Users/jayden/project/dairect/docs/design-references/redesign-2026/DESIGN.md`가 Single Source of Truth
- ❌ **Newsreader / Noto Serif / Manrope / 웜 골드 색상은 사용하지 않는다** — DM Sans + Pretendard + Indigo #4F46E5만 사용
- ❌ **1px 솔리드 테두리는 사용하지 않는다** (DESIGN.md No-Line Rule) — 배경 톤 전환으로만 경계 표현
- ❌ **순수 검정(#000000) 사용 금지** — gray-900 #111827로 대체
- ❌ **한글 헤드라인에 대문자/wide letter-spacing 적용 금지** (DESIGN.md 규칙)
- ❌ **Nav 메뉴에 영문 사용 금지** — 한글로 통일 (서비스 / 포트폴리오 / 가격 / 소개)
  - 시안에 Features/Work/Process 등 영문 버전이 있으나 여러 방향성 탐색용. 최종 구현은 한글
- ❌ **Hero 메인 섹션에 "Vibe Architect" 또는 "디렉팅" 용어 노출 금지** — /about 페이지에서만 전문가 소개용으로 사용
- ❌ **블로그/CMS는 Phase 1~4에서 구현하지 않는다**
- ❌ **댓글/커뮤니티 기능은 만들지 않는다** — 문의는 폼/카카오톡으로만
- ❌ **브랜드 슬로건 "코드는 AI가, 방향은 내가"를 완전히 제거하지 않는다** — Hero에서는 빼되 Footer에 유지 (브랜드 DNA 보존)
- ❌ **뉴스레터를 메인 CTA로 되돌리지 않는다** — Footer로 이동, 메인 CTA는 "내 아이디어 상담하기 →"

#### 대시보드 관련
- ❌ **실시간 채팅/메시징은 구현하지 않는다** — 카카오톡/이메일 외부 연동으로 대체
- ❌ **위시켓/크몽 API 자동 연동은 구현하지 않는다** — 공식 API 미제공
- ❌ **전자서명을 자체 구현하지 않는다** — 모두싸인 외부 링크 연동만
- ❌ **고객 포털에서 파일 업로드 기능은 Phase 5에서도 구현하지 않는다** — 보안 이슈
- ❌ **SaaS 멀티테넌트 구조를 Phase 1~3에서는 활성화하지 않는다** — DB 스키마는 미리 준비(user_id FK)하되 단일 사용자 전용으로 동작
- ❌ **칸반 드래그 앤 드롭은 Phase 1에서 구현하지 않는다** — Phase 2로 미룸. Phase 1은 드롭다운으로 대체

### Phase 2 이후로 미룰 것

| 기능 | 목표 Phase |
|------|----------|
| 칸반 드래그 앤 드롭 (S-D2) | Phase 2 |
| 포트폴리오 자동 반영 (S-C1) | Phase 2 |
| 리드 CRM (S-D1) | Phase 3 |
| AI 견적 초안 (S-D3) | Phase 3 |
| AI 주간 보고서 (S-D4) | Phase 3 |
| AI 주간 브리핑 (S-D5) | Phase 3 |
| n8n 자동화 (S-D6) | Phase 3 |
| 경비 관리 (C-D2) | Phase 4 |
| 시간 추적 (C-D3) | Phase 4 |
| PWA (C-D4) | Phase 4 |
| 고객 포털 (C-P1) | Phase 5 |
| 팀원 관리 (C-D1) | Phase 5 (SaaS 전환 시) |

---

## 8. Phase 구현 계획 (Phase 0~5)

### 개요

```
총 6 Phase, 약 22~25일 (4.5~5주)
Phase 0: 기반 (1일)
Phase 1: 대시보드 핵심 (5일)
Phase 2: 견적/계약/정산 + 공개 연동 + 리브랜딩 (7일, v3.1 +2일)
Phase 3: AI + 자동화 + 리드 CRM (4일)
Phase 4: 고객 포털 + /demo + PWA (3~4일)
Phase 5: SaaS 전환 준비 (2~3일, 옵션)
```

### Phase 0: 기반 설정 [의존성: 없음] — 1일

```
Task 0-1: 프로젝트 초기 세팅 (0.3일)
  - 기존 dairect.kr 레포 브랜치 생성 (feature/v3-dashboard)
  - Next.js 16.2 App Router 유지 + Turbopack
  - Supabase 프로젝트 생성 (도쿄 리전, 한국 최적)
  - Drizzle ORM 설정 + 마이그레이션 구조
  - 디자인 시스템 토큰 통합 (기존 MD3 토큰 + design-system.md 병합)
  - Vercel 배포 설정 (Preview URL 활성화)
  - 완료 기준: Preview URL 접속 가능 + Supabase 연결 확인

Task 0-2: 라우트 구조 생성 (0.2일)
  - /app/(public)/ — 랜딩, /projects, /demo, /login
  - /app/(dashboard)/ — 모든 대시보드 페이지
  - /app/portal/[token]/ — Phase 5용 스켈레톤
  - 인증 미들웨어 (/dashboard/* 보호)
  - 완료 기준: 비로그인 → /dashboard 접근 → /login 리다이렉트

Task 0-3: Supabase Auth + Google OAuth (0.3일)
  - Supabase Auth 설정
  - Google Cloud Console OAuth 앱 등록
  - 로그인/로그아웃 UI (기존 디자인 시스템 적용)
  - 첫 로그인 시 users + user_settings 자동 생성
  - 완료 기준: Google 로그인 성공 → /dashboard 이동

Task 0-4: DB 스키마 v1 (0.2일)
  - 전체 테이블 생성 (아래 섹션 10 참조)
  - RLS 정책 적용 (user_id 기반 격리)
  - 채번 함수 (EST-YYYY-NNN, CON-YYYY-NNN, INV-YYYY-NNN)
  - 완료 기준: Drizzle 마이그레이션 성공 + Supabase에 모든 테이블 생성
```

### Phase 1: 대시보드 핵심 [의존성: Phase 0] — 5일

```
Task 1-1: 대시보드 레이아웃 (0.5일)
  - 사이드바 (6개 메뉴) + 헤더 + 메인
  - 반응형 (≤768px 하단 탭바)
  - 완료 기준: 메뉴 클릭 → 빈 페이지 렌더링

Task 1-2: 프로젝트 CRUD (1일)
  - 프로젝트 목록 (리스트 뷰)
  - 프로젝트 생성 모달 (고객 연결 포함)
  - 프로젝트 상세 페이지 (탭: 개요/마일스톤/견적/계약/정산/메모)
  - 프로젝트 상태 변경 (드롭다운)
  - 소프트 삭제
  - 완료 기준: 프로젝트 10개 등록 + 상태 변경 + 상세 이동

Task 1-3: 칸반 뷰 (0.5일)
  - 4개 컬럼: 대기/진행/완료/정산완료
  - 카드: 프로젝트명, 고객, 금액, 기간, 수금 미니 타임라인
  - Phase 1에서는 드롭다운으로 상태 변경 (드래그는 Phase 2)
  - 리스트 ↔ 칸반 뷰 전환 토글
  - 완료 기준: 칸반에서 5개 프로젝트가 상태별로 표시

Task 1-4: 고객 CRM (1일)
  - 고객 목록 + 검색 + 정렬
  - 고객 생성 모달
  - 고객 상세 페이지: 정보 + 프로젝트 히스토리 + 소통 메모
  - 완료 기준: 고객 3명 등록 + 프로젝트 연결 + 메모 추가

Task 1-5: 마일스톤 관리 (0.5일)
  - 프로젝트별 마일스톤 CRUD
  - 체크리스트 UI
  - 진행률 자동 계산
  - 완료 기준: 마일스톤 5개 생성 → 3개 체크 → 60% 표시

Task 1-6: KPI 홈 대시보드 (1일)
  - KPI 카드 4개 (실시간 데이터 반영)
  - 월별 매출 Bar 차트 (Recharts)
  - 고객별 매출 Pie 차트
  - 최근 활동 타임라인 (activity_logs 테이블 조회)
  - 다가오는 마일스톤/납기 리스트
  - Empty State 정의
  - 완료 기준: 실제 프로젝트 데이터가 모든 위젯에 반영

Task 1-7: 설정 페이지 (0.5일)
  - 회사 정보 입력 (견적서/계약서 자동 반영)
  - 견적서 기본값 (일 단가, 수금 비율)
  - 저장 시 user_settings 업데이트
  - 완료 기준: 정보 입력 → 저장 → 재접속 시 유지
```

### Phase 2: 견적·계약·정산 + 공개 연동 + 리브랜딩 [의존성: Phase 1] — 7일

```
Task 2-1: 견적서 생성기 — 수동 모드 (0.5일)
  - 견적서 목록 + 상태 필터
  - 견적서 생성 페이지 (풀페이지)
  - 항목 추가/삭제/정렬
  - 자동 계산: 소계/공급가액/부가세/총액
  - 견적서 번호 자동 채번
  - 버전 관리 (수정 시 v2 자동 생성)
  - 완료 기준: 견적서 생성 → 항목 5개 → 자동 계산 정확

Task 2-2: 견적서 생성기 — 자동 산정 모드 (1일)
  - 기능 프리셋 25종 기본 데이터 삽입
  - 체크리스트 UI (카테고리별 그룹)
  - 실시간 자동 계산
  - 수금 계획 자동 분배
  - 설정 페이지에서 프리셋 CRUD
  - 완료 기준: 체크 → 금액 자동 표시 → 견적서 저장

Task 2-3: 견적서 PDF 생성 (0.5일)
  - @react-pdf/renderer로 한국식 견적서 양식
  - Dairect 로고 + 브랜드
  - 다운로드 + 이메일 발송 (mailto:)
  - 완료 기준: 실제 고객에게 보내도 손색없는 PDF

Task 2-4: 계약서 생성기 (1일)
  - 표준 SI 계약서 템플릿
  - 변수 자동 매핑 (프로젝트/고객/견적서)
  - 편집 가능 영역 (하자보수/IP/손해배상)
  - PDF 생성
  - 상태 추적: 초안/발송/서명완료/보관
  - 모두싸인 외부 링크 연동 (URL 입력 필드)
  - 완료 기준: 계약서 생성 → 변수 자동 매핑 → PDF 다운

Task 2-5: 정산 관리 (1일)
  - 프로젝트별 수금 현황 테이블
  - 인보이스 자동 생성 (견적서 기반)
  - 인보이스 PDF
  - 세금계산서 발행 도우미 (정보 표시 + 홈택스 링크)
  - 수금 현황 페이지 (타임라인 + 연체 경고)
  - 입금 확인 → 프로젝트 상태 자동 전환 (옵션)
  - 완료 기준: 착수금 청구서 발행 → 입금 확인 → 중도금 전환

Task 2-6: 칸반 드래그 앤 드롭 (0.5일)
  - @dnd-kit 적용
  - 카드 드래그 → 상태 변경 + 활동 로그
  - 완료 기준: 카드 드래그 → 컬럼 이동 → 상태 업데이트

Task 2-7: 공개 연동 — /projects 자동 반영 (0.5일)
  - 프로젝트 상세에 "공개" 토글
  - 공개용 별칭, 설명, 기술 태그 필드
  - 스크린샷 업로드 (Supabase Storage)
  - /projects 페이지: is_public=true 프로젝트만 표시
  - 완료 기준: 토글 ON → /projects에 즉시 반영

Task 2-8: 랜딩 + 공개 페이지 리브랜딩 (v3.1, 3일)
  전제:
  - 글로벌 design-system.md 폐기, 로컬 DESIGN.md 준수
  - 참조 경로: /Users/jayden/project/dairect/docs/design-references/redesign-2026/
  - 해당 폴더의 HTML + 이미지 7장 전체 확인 필수

  [Day 1] 디자인 토큰 + 폰트 + 공통 컴포넌트
  - globals.css에 DESIGN.md 토큰 적용 (Indigo, Surface, Surface Container Low/Lowest 등)
  - 폰트 교체: Newsreader → DM Sans, Noto → Pretendard Variable
  - JetBrains Mono 추가 (뱃지/코드용)
  - 공통 컴포넌트 리팩토링:
    - <Button> variant: primary(Indigo Soul Gradient) / ghost / dark
    - <Card> Bento Grid 대응 (aspect-ratio props)
    - <Badge> JetBrains Mono pill
    - No-Line Rule 적용 (border 제거, bg 톤만)
  - 공개 영역 공통 Nav + Footer 리디자인 (Glassmorphism, 다크 Footer)

  [Day 2] 랜딩 메인 페이지 (7섹션 구현)
  - Section 1: Nav
  - Section 2: Hero (3D 기기 목업 이미지 + 스탯 바)
  - Section 3: 문제 정의 "이런 경험, 있으시죠?" 3카드
  - Section 4: 프로세스 "이렇게 진행됩니다" 4단계
  - Section 5: 포트폴리오 프리뷰 (Top 3)
  - Section 6: 가격 프리뷰 (3패키지 요약)
  - Section 7: 하단 CTA "무엇을 고민하고 계신가요?"
  - Section 8: Footer (다크, 슬로건 유지)

  [Day 3] 공개 페이지 4종 + 문의 API
  - /projects (시안 이미지 4): Bento Grid 비대칭, 공개 프로젝트 자동 반영
  - /pricing (시안 이미지 3): 3패키지 (진단/MVP/확장), MVP 중앙 강조
  - /about (시안 이미지 6): Jayden Hero (다크) + 상세 문의 폼
  - /services: Phase 3으로 미룸 (시안 없음, 콘텐츠 확정 후 작성)
  - POST /api/v1/public/inquiries: 문의 폼 저장
  - inquiries 테이블 스키마 확장: budget_range (radio 4종), schedule (radio 3종)
  - Jayden에게 이메일 알림 (Vercel 환경변수)

  완료 기준:
  - 시안 7장과 시각적 일치도 95%+
  - 4개 공개 페이지 (/, /projects, /pricing, /about) 정상 동작
  - 문의 폼 제출 → DB 저장 + 이메일 알림
  - 모바일 반응형 (≤768px)
  - Lighthouse 성능 90+ / 접근성 95+
```

### Phase 3: AI + 자동화 + 리드 CRM [의존성: Phase 2] — 4일

```
Task 3-1: AI 견적 초안 생성 (1일)
  - Claude Sonnet 4.6 API 연동
  - 프롬프트: "요구사항 → JSON 견적 항목 배열"
  - 입력 텍스트 → 항목 자동 분해 → 견적서 폼 자동 입력
  - 사용자 검토/수정 필수
  - 환각 방지: "입력된 요구사항에만 기반하여" 프롬프트 명시
  - 완료 기준: "쇼핑몰 만들고 싶다" → 10개 항목 자동 생성

Task 3-2: AI 주간 브리핑 (0.5일)
  - 대시보드 홈 상단 위젯
  - 자동 생성 데이터: 이번 주 수금 예정, 미수금 경고, 완료 임박, 집중할 것
  - [새로고침] 버튼
  - 주 1회 자동 생성, 캐시
  - 완료 기준: 대시보드 접속 → 브리핑 표시

Task 3-3: AI 주간 보고서 생성 (0.5일)
  - 프로젝트 상세에서 [주간 보고서 생성] 버튼
  - 입력: 이번 주 완료 마일스톤 + 변경사항
  - 출력: 마크다운 초안 → PDF 변환
  - 반드시 사용자 검토 후 고객 발송
  - 완료 기준: 보고서 생성 → PDF 다운로드

Task 3-4: 리드 CRM (1일)
  - 리드 목록 + 상태 관리
  - 리드 소스 필터
  - 랜딩 문의 폼 → 리드 자동 생성 API
  - 리드 → 프로젝트 전환 버튼
  - 전환율 분석 차트
  - 완료 기준: 랜딩 폼 제출 → 리드 생성 → 프로젝트 전환

Task 3-5: n8n Webhook 연동 (1일)
  - Supabase Database Webhook 설정
  - n8n 엔드포인트 4종 생성:
    - W1: project.status_changed → Slack
    - W2: invoice.overdue → 이메일 리마인더
    - W3: 매주 금요일 17:00 → 주간 보고서 초안 이메일
    - W4: project.completed → 만족도 설문 이메일
  - 완료 기준: 프로젝트 상태 변경 → Slack 메시지 도착
```

### Phase 4: 고객 포털 + /demo + PWA [의존성: Phase 3] — 3~4일

```
Task 4-1: /demo 라우트 (1일)
  - 비로그인 접근 가능
  - 샘플 데이터 하드코딩 (프로젝트 5, 고객 3, 견적 3)
  - 상단 배너 "데모 모드"
  - 모든 CRUD 버튼 비활성
  - 비활성 버튼 클릭 시 토스트
  - 완료 기준: 비로그인 → /demo → 전체 기능 체험

Task 4-2: 고객 포털 /portal/[token] (1.5일)
  - portal_tokens 테이블 생성
  - 프로젝트 상세에서 "포털 링크 생성" 버튼
  - 토큰 URL 복사/이메일 발송
  - 고객 뷰: 진행률, 마일스톤, 납품물, 인보이스 (본인 프로젝트 건만)
  - 피드백 폼
  - 토큰 만료 (1년)
  - 완료 기준: 토큰 URL → 고객 뷰 → 피드백 제출

Task 4-3: 경비 관리 (선택, 0.5일)
  - 프로젝트별 경비 CRUD
  - 카테고리 분류
  - 부가세 매입세액 표시
  - 완료 기준: 경비 3건 등록 → 월별 집계

Task 4-4: PWA 지원 (0.5일)
  - manifest.json + Service Worker
  - 오프라인 읽기 전용
  - "홈 화면 추가" 프롬프트
  - 완료 기준: 모바일에서 PWA 설치 가능
```

### Phase 5: Multi-tenant 전환 [의존성: Phase 4] — 약 8주 (Phase 5.5 Billing 취소 반영)

> 🆕 **Phase 5 상세는 [PRD v4.0 (docs/PRD-phase5.md)](./PRD-phase5.md)로 분리되었다.** 이 섹션은 v3.1의 초안 스케치(2~3일)를 대체한다.
>
> ⛔ **2026-04-24 업데이트**: Phase 5.5 Billing 전면 취소. Phase 5.0 Multi-tenant만 진행.

**v3.1 → v4.0 변경 요약:**
- **범위**: 단일 문서 2~3일 스케치 → 별도 PRD로 분리. ~~11주 타임라인 (Phase 5.0 + 베타 + Phase 5.5)~~ → **8주 (Phase 5.0 + 베타, 5.5 취소)**
- ~~**2단계 전환**: Phase 5.0 (Multi-tenant 기반, 🟡) → 지인 베타 → Phase 5.5 (Billing, 🔴)~~ → **Phase 5.0 Multi-tenant만 (🟡 유지)**
- ~~**5 Epic / 36 Task**: Data Model / Onboarding / Billing / 기존 기능 확장 / Admin+Observability~~ → **4 Epic / 26 Task** (Billing Epic 5-3 10 Task 제거)
- ~~**결제 스택 변경**: TossPayments → Stripe 우선 (토스페이먼츠는 Phase 5.6+ 재검토)~~ ⛔ **폐기**
- **보안 설계 강화**: Workspace 기반 RLS 전면 재작성 (12테이블 × 4 policy = 48개), ~~Stripe Webhook idempotency~~, Feature flag `MULTITENANT_ENABLED` 점진 릴리스

**참조:**
- [PRD-phase5.md](./PRD-phase5.md) — 12개 섹션 (개요 / 목적 / 만들지 않을 것 14개 / Epic → Task / DoD / 리스크 7개 / 의존성 / 타임라인 / 후속 결정 / 리뷰 체크리스트)
- Phase 3 cron 선제 대비: W2/W3에서 이미 BigInt-safe 금액 + deadline gate + user별 루프 구조 적용 완료 → Epic 5-4 부담 최소

> **v3.1 원본 스케치(2~3일, Task 5-1/5-2/5-3 TossPayments 기준)는 PRD v4.0으로 대체됨.** git log에서 확인 가능.

### ⛔ 각 Phase의 Not Doing

| Phase | 하지 않을 것 |
|-------|------------|
| 0 | 카카오/네이버 로그인은 구현하지 않음 (Google만) |
| 1 | 칸반 드래그&드롭은 구현하지 않음 (드롭다운만) |
| 1 | 프로젝트 고급 필터는 구현하지 않음 (텍스트 검색만) |
| 2 | 전자서명 자체 구현 금지 (모두싸인 링크만) |
| 2 | 환율/다통화 지원 금지 (KRW만) |
| 2 | 랜딩 전체 리디자인 금지 (요소 추가/수정만) |
| 3 | AI가 생성한 내용을 사용자 확인 없이 고객에게 발송 금지 |
| 3 | n8n 워크플로우에 결제/정산 금액 변경 로직 포함 금지 (🟡 부분보안 원칙) |
| 4 | 고객 포털에서 파일 업로드 금지 |
| 4 | 경비 관리에 영수증 OCR 추가 금지 |
| 5 | 다국어 · 커스텀 도메인 · SSO · Marketplace 등 엔터프라이즈 기능 금지 ([PRD v4.0 / PRD-phase5.md](./PRD-phase5.md) 섹션 3 참조) |

---

## 9. 기술 스택 + 아키텍처

### 코어 스택

| 영역 | 기술 | 선택 근거 |
|------|------|----------|
| 프론트엔드 | Next.js 16.2 App Router | 기존 dairect.kr 스택 유지 |
| 런타임 | Turbopack | 개발 속도 |
| UI | shadcn/ui + Tailwind CSS | 커스텀 디자인 시스템 적용 |
| DB | Supabase PostgreSQL + RLS | 인증 + DB + 스토리지 통합 |
| ORM | Drizzle ORM | 타입 안전 |
| 인증 | Supabase Auth (Google OAuth) | 간편한 OAuth 연동 |
| AI | Claude Sonnet 4.6 API | 견적 분해, 보고서 생성 |
| PDF | @react-pdf/renderer | 한국식 문서 양식 |
| 차트 | Recharts | shadcn/ui 호환 |
| 드래그 | @dnd-kit (Phase 2+) | 칸반 드래그 앤 드롭 |
| 배포 | Vercel | Preview URL → main 머지 |
| 자동화 | n8n (Elest.io) | Phase 3부터 webhook 연동 |
| 스토리지 | Supabase Storage | 스크린샷, 계약서 파일 |

### 2레이어 아키텍처

```
┌────────────────────────────────────────────────┐
│  Layer 1: Next.js + Supabase (직접 코딩)         │
│                                                │
│  [공개 영역]                                     │
│   ├─ 랜딩 (/)                                   │
│   ├─ 포트폴리오 (/projects)                      │
│   ├─ 데모 (/demo)                                │
│   └─ 고객 포털 (/portal/[token])                 │
│                                                │
│  [비공개 영역]                                   │
│   ├─ 대시보드 전체                                │
│   ├─ 견적서/계약서/인보이스 CRUD                   │
│   ├─ PDF 생성                                   │
│   └─ 정산 금액 변경 로직 🟡                       │
│                                                │
│  → Git 관리 → Claude Code로 구현                │
└─────────────────┬──────────────────────────────┘
                  │ Supabase Database Webhook
┌─────────────────▼──────────────────────────────┐
│  Layer 2: n8n (Phase 3부터)                      │
│                                                │
│  - Slack/이메일 알림                             │
│  - 주간 보고서 자동 발송                           │
│  - 미수금 리마인더                                │
│  - 만족도 설문 발송                               │
│                                                │
│  ⚠️ 정산 금액/계약 조건 변경은 n8n 불가           │
│     (보안 분류 🟡: 금액/신분 관련은 직접 코드)     │
└────────────────────────────────────────────────┘
```

### 보안 정책

| 항목 | 구현 |
|------|------|
| 인증 | Supabase Auth JWT |
| 데이터 격리 | RLS (user_id 기반 모든 테이블 적용) |
| 민감 정보 | 사업자번호, 계좌번호 → Supabase 암호화 컬럼 |
| CORS | Vercel 도메인 + 고객 포털 토큰만 허용 |
| Rate Limit | API 라우트당 100req/분 |
| 입력 검증 | Zod 스키마 + 서버사이드 이중 검증 |
| n8n 제한 | 금액/상태 변경은 n8n 금지 (알림/발송만) |
| 고객 포털 | 토큰 기반 읽기 전용 + 만료 관리 |

---

## 10. DB 스키마

```sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 사용자 + 설정
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

users (
  id UUID PK DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

user_settings (
  user_id UUID PK FK → users.id,
  -- 회사 정보 (견적서/계약서 자동 반영)
  company_name TEXT,
  representative_name TEXT,
  business_number TEXT,      -- 사업자등록번호 (암호화)
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  bank_info JSONB,           -- {bank, account_number, holder} (암호화)

  -- 견적서 기본값
  estimate_number_prefix TEXT DEFAULT 'EST',
  contract_number_prefix TEXT DEFAULT 'CON',
  invoice_number_prefix TEXT DEFAULT 'INV',
  daily_rate BIGINT DEFAULT 700000,  -- Jayden 일 단가 (원)
  default_payment_split JSONB DEFAULT '[
    {"label":"착수금","percentage":30},
    {"label":"중도금","percentage":40},
    {"label":"잔금","percentage":30}
  ]'::jsonb,

  -- 기능 프리셋 (자동 산정용)
  feature_presets JSONB DEFAULT '[
    {"name":"기획/설계","category":"기타","base_days":2,"difficulty":1.0},
    {"name":"소셜 로그인","category":"인증","base_days":1.5,"difficulty":1.0},
    {"name":"대시보드","category":"프론트","base_days":3,"difficulty":1.2},
    {"name":"CRUD API","category":"백엔드","base_days":0.5,"difficulty":1.0},
    {"name":"PDF 생성","category":"백엔드","base_days":2,"difficulty":1.2},
    {"name":"Claude API 연동","category":"AI","base_days":2,"difficulty":1.3},
    {"name":"TossPayments 결제","category":"결제","base_days":3,"difficulty":1.5},
    {"name":"테스트/QA","category":"기타","base_days":2,"difficulty":1.0},
    {"name":"배포/런칭","category":"기타","base_days":1,"difficulty":1.0}
    -- ... 총 25종
  ]'::jsonb,

  updated_at TIMESTAMPTZ DEFAULT now()
)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 고객 + 리드
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

clients (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → users.id,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  business_number TEXT,    -- 고객 사업자번호 (세금계산서용)
  address TEXT,
  status TEXT CHECK (status IN ('prospect','active','completed','returning')) DEFAULT 'prospect',
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

client_notes (
  id UUID PK DEFAULT gen_random_uuid(),
  client_id UUID FK → clients.id,
  user_id UUID FK → users.id,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
)

leads (  -- Phase 3
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → users.id,
  source TEXT CHECK (source IN ('wishket','kmong','referral','direct','landing_form','other')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  project_type TEXT,
  budget_range TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('new','scheduled','consulted','estimated','contracted','failed')) DEFAULT 'new',
  fail_reason TEXT,
  converted_to_project_id UUID FK → projects.id,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 프로젝트 + 마일스톤
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

projects (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → users.id,
  client_id UUID FK → clients.id,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN (
    'lead','consulting','estimate','contract',
    'in_progress','review','completed','warranty','closed',
    'cancelled','failed'
  )) DEFAULT 'lead',
  expected_amount BIGINT,
  contract_amount BIGINT,
  start_date DATE,
  end_date DATE,
  warranty_end_date DATE,
  fail_reason TEXT,
  tags TEXT[],           -- 기술 스택 태그
  memo TEXT,             -- 내부 메모
  deleted_at TIMESTAMPTZ, -- 소프트 삭제

  -- 공개 영역 연동 (Phase 2)
  is_public BOOLEAN DEFAULT false,
  public_alias TEXT,       -- 공개용 프로젝트명 (원본과 다를 수 있음)
  public_description TEXT, -- 공개용 한줄 설명
  public_tags TEXT[],      -- 공개용 기술 태그
  public_screenshot_url TEXT, -- Supabase Storage URL
  public_live_url TEXT,    -- 외부 라이브 URL

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

milestones (
  id UUID PK DEFAULT gen_random_uuid(),
  project_id UUID FK → projects.id,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 견적서
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

estimates (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → users.id,
  project_id UUID FK → projects.id,
  client_id UUID FK → clients.id,
  estimate_number TEXT NOT NULL,  -- EST-2026-001
  version INT DEFAULT 1,
  parent_estimate_id UUID FK → estimates.id, -- 이전 버전
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft','sent','accepted','rejected','expired')) DEFAULT 'draft',
  valid_until DATE,
  input_mode TEXT CHECK (input_mode IN ('manual','auto','ai')) DEFAULT 'manual',
  payment_split JSONB DEFAULT '[...]'::jsonb,  -- 수금 계획
  supply_amount BIGINT,      -- 공급가액
  tax_amount BIGINT,         -- 부가세
  total_amount BIGINT,       -- 총액
  total_days DECIMAL(5,1),   -- 총 소요일 (자동산정 모드)
  notes TEXT,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  pdf_url TEXT,              -- Supabase Storage
  created_at TIMESTAMPTZ DEFAULT now()
)

estimate_items (
  id UUID PK DEFAULT gen_random_uuid(),
  estimate_id UUID FK → estimates.id,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,             -- 자동산정 모드 카테고리
  man_days DECIMAL(5,1),
  difficulty DECIMAL(3,1) DEFAULT 1.0,
  unit_price BIGINT,
  quantity INT DEFAULT 1,
  subtotal BIGINT,
  sort_order INT DEFAULT 0
)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 계약서
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

contracts (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → users.id,
  project_id UUID FK → projects.id,
  estimate_id UUID FK → estimates.id,
  contract_number TEXT NOT NULL,   -- CON-2026-001
  status TEXT CHECK (status IN ('draft','sent','signed','archived')) DEFAULT 'draft',
  warranty_months INT DEFAULT 3,
  ip_ownership TEXT CHECK (ip_ownership IN ('client','developer','shared')) DEFAULT 'client',
  liability_limit BIGINT,
  special_terms TEXT,
  mosign_url TEXT,          -- 모두싸인 외부 URL
  signed_at TIMESTAMPTZ,
  signed_file_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 인보이스 (청구서 / 수금)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

invoices (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → users.id,
  project_id UUID FK → projects.id,
  estimate_id UUID FK → estimates.id,
  invoice_number TEXT NOT NULL,    -- INV-2026-001
  type TEXT CHECK (type IN ('advance','interim','final')) NOT NULL,
  status TEXT CHECK (status IN ('pending','sent','paid','overdue','cancelled')) DEFAULT 'pending',
  amount BIGINT NOT NULL,          -- 공급가액
  tax_amount BIGINT NOT NULL,      -- 부가세
  total_amount BIGINT NOT NULL,
  issued_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  sent_at TIMESTAMPTZ,
  paid_date DATE,
  paid_amount BIGINT,
  tax_invoice_issued BOOLEAN DEFAULT false,  -- 세금계산서 발행 여부
  memo TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 활동 로그 + 고객 포털 (Phase 4)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

activity_logs (
  id UUID PK DEFAULT gen_random_uuid(),
  user_id UUID FK → users.id,
  project_id UUID FK → projects.id,
  entity_type TEXT,  -- 'project'|'estimate'|'contract'|'invoice'|'client'
  entity_id UUID,
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
)

portal_tokens (  -- Phase 4
  token TEXT PK,
  user_id UUID FK → users.id,
  project_id UUID FK → projects.id,
  expires_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)

portal_feedbacks (  -- Phase 4
  id UUID PK DEFAULT gen_random_uuid(),
  project_id UUID FK → projects.id,
  milestone_id UUID FK → milestones.id,
  content TEXT NOT NULL,
  feedback_type TEXT CHECK (feedback_type IN ('review','revision','approval')),
  created_at TIMESTAMPTZ DEFAULT now()
)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 랜딩 문의 폼 (Phase 2)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

inquiries (  -- 랜딩 "문의하기" + /about 문의 폼
  id UUID PK DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,           -- 전화번호 또는 이메일 (v3.1: 시안 반영)
  idea_summary TEXT,               -- 아이디어 한줄 요약 (50자, v3.1)
  description TEXT,                -- 상세 설명 (v3.1: description 유지)
  budget_range TEXT CHECK (budget_range IN (
    'under_100','100_to_300','over_300','unsure'
  )),                              -- v3.1: 라디오 4종
  schedule TEXT CHECK (schedule IN (
    'within_1month','1_to_3months','flexible'
  )),                              -- v3.1: 라디오 3종
  -- 기존 project_type는 deprecated (시안에 없음, idea_summary로 대체)
  status TEXT CHECK (status IN ('new','contacted','converted','archived')) DEFAULT 'new',
  converted_to_lead_id UUID FK → leads.id,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### RLS 정책

```sql
-- 모든 사용자 데이터 테이블에 적용
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own data"
  ON projects FOR ALL
  USING (user_id = auth.uid());

-- clients, estimates, contracts, invoices, milestones, leads, activity_logs에 동일 정책

-- 공개 프로젝트 조회 (익명 사용자 허용)
CREATE POLICY "Public projects readable by anyone"
  ON projects FOR SELECT
  USING (is_public = true AND deleted_at IS NULL);

-- 고객 포털 (Phase 4)
CREATE POLICY "Portal access by valid token"
  ON projects FOR SELECT
  USING (id IN (
    SELECT project_id FROM portal_tokens
    WHERE token = current_setting('app.portal_token', true)
    AND expires_at > now()
  ));

-- 랜딩 문의 폼 (익명 INSERT만 허용)
CREATE POLICY "Anyone can submit inquiry"
  ON inquiries FOR INSERT
  WITH CHECK (true);
```

---

## 11. API 라우트 구조

```
/api/v1/
│
├── auth/
│   ├── POST /login           → Supabase Auth (Google OAuth 콜백)
│   ├── POST /logout
│   └── GET  /session
│
├── projects/
│   ├── GET    /              → 프로젝트 목록
│   ├── POST   /              → 생성
│   ├── GET    /[id]          → 상세
│   ├── PATCH  /[id]          → 수정
│   ├── DELETE /[id]          → 소프트 삭제
│   ├── PATCH  /[id]/status   → 상태 변경
│   └── PATCH  /[id]/publish  → 공개 토글 (Phase 2)
│
├── milestones/
│   ├── GET    /project/[projectId]
│   ├── POST   /
│   ├── PATCH  /[id]
│   └── DELETE /[id]
│
├── clients/
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /[id]
│   ├── PATCH  /[id]
│   ├── DELETE /[id]
│   └── POST   /[id]/notes    → 소통 메모 추가
│
├── estimates/
│   ├── GET    /
│   ├── POST   /              → 견적서 생성 (수동/자동/AI 모드)
│   ├── GET    /[id]
│   ├── PATCH  /[id]          → 수정 (새 버전 자동 생성)
│   ├── DELETE /[id]
│   ├── POST   /[id]/pdf      → PDF 생성
│   ├── POST   /[id]/send     → 이메일 발송
│   └── POST   /calculate     → 자동 산정 계산 (저장 전 프리뷰)
│
├── contracts/
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /[id]
│   ├── PATCH  /[id]
│   └── POST   /[id]/pdf
│
├── invoices/
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /[id]
│   ├── PATCH  /[id]          → 상태 변경 (입금 확인 등) 🟡 직접 코드만
│   └── POST   /[id]/pdf
│
├── leads/                    → Phase 3
│   ├── GET    /
│   ├── POST   /              → 수동 생성
│   ├── PATCH  /[id]
│   └── POST   /[id]/convert  → 프로젝트 전환
│
├── dashboard/
│   ├── GET /stats            → KPI 통계
│   ├── GET /revenue-chart    → 월별 매출 데이터
│   ├── GET /client-chart     → 고객별 매출
│   ├── GET /recent-activity  → 최근 활동
│   └── GET /upcoming         → 다가오는 마일스톤/수금
│
├── ai/                       → Phase 3
│   ├── POST /estimate-draft  → 견적 초안 생성
│   ├── POST /weekly-report   → 주간 보고서 초안
│   └── POST /weekly-briefing → AI 주간 브리핑
│
├── portal/                   → Phase 4
│   ├── POST /tokens          → 토큰 생성
│   ├── GET  /tokens/[token]  → 포털 데이터 조회
│   └── POST /feedbacks       → 피드백 제출
│
├── public/
│   ├── GET  /projects        → 공개 프로젝트 목록 (/projects 페이지용)
│   ├── POST /inquiries       → 랜딩 문의 폼 제출
│   └── POST /newsletter      → 뉴스레터 구독 (Footer)
│
├── settings/
│   ├── GET   /               → user_settings 조회
│   ├── PATCH /               → 수정
│   └── ── feature_presets/
│       ├── POST    /         → 프리셋 추가
│       ├── PATCH   /[idx]    → 수정
│       └── DELETE  /[idx]    → 삭제
│
└── webhooks/                 → Phase 3, n8n용
    ├── POST /n8n/project-status-changed
    ├── POST /n8n/invoice-overdue
    └── POST /n8n/project-completed
```

---

## 12. 폴더 구조

```
src/
├── app/
│   ├── (public)/                    ← 공개 영역
│   │   ├── page.tsx                 ← 랜딩 (기존)
│   │   ├── projects/page.tsx        ← /projects 쇼케이스
│   │   ├── demo/page.tsx            ← /demo 대시보드 데모
│   │   ├── login/page.tsx           ← Google OAuth
│   │   ├── terms/page.tsx           ← 기존
│   │   └── privacy/page.tsx         ← 기존
│   │
│   ├── (dashboard)/                 ← 비공개 영역
│   │   ├── layout.tsx               ← 사이드바 + 헤더
│   │   ├── dashboard/
│   │   │   └── page.tsx             ← 홈 (KPI + 브리핑)
│   │   ├── projects/
│   │   │   ├── page.tsx             ← 리스트/칸반 토글
│   │   │   └── [id]/
│   │   │       └── page.tsx         ← 탭: 개요/마일스톤/견적/계약/정산/메모
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── estimates/
│   │   │   ├── page.tsx             ← 목록
│   │   │   ├── new/page.tsx         ← 생성 (수동/자동/AI)
│   │   │   └── [id]/page.tsx        ← 상세/수정
│   │   ├── contracts/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── invoices/page.tsx
│   │   ├── leads/page.tsx           ← Phase 3
│   │   └── settings/page.tsx
│   │
│   ├── portal/
│   │   └── [token]/page.tsx         ← Phase 4 고객 포털
│   │
│   └── api/v1/                      ← API 라우트 (위 섹션 11)
│
├── components/
│   ├── ui/                          ← shadcn/ui
│   ├── layout/
│   │   ├── public-nav.tsx           ← 공개 영역 Nav
│   │   ├── dashboard-sidebar.tsx
│   │   ├── dashboard-header.tsx
│   │   └── mobile-nav.tsx
│   ├── landing/                     ← 랜딩 전용 (v3.1 시안 기반 재구성)
│   │   ├── nav.tsx                  ← Glassmorphism Nav (서비스/포트폴리오/가격/소개)
│   │   ├── hero-section.tsx         ← Hero + 3D 기기 목업
│   │   ├── stats-bar.tsx            ← 10+/2주/98%
│   │   ├── pain-points-section.tsx  ← "이런 경험, 있으시죠?" 3카드 Bento
│   │   ├── process-section.tsx      ← "이렇게 진행됩니다" 4단계 + AI/품질 2카드
│   │   ├── portfolio-preview.tsx    ← Top 3 프로젝트 Bento
│   │   ├── pricing-preview.tsx      ← 3패키지 요약
│   │   ├── bottom-cta-section.tsx   ← "무엇을 고민하고 계신가요?"
│   │   └── footer.tsx               ← 다크 Footer (슬로건 유지)
│   ├── pricing/                     ← v3.1 신규
│   │   ├── plan-card.tsx            ← 진단/MVP/확장
│   │   ├── featured-badge.tsx       ← "가장 많이 선택해요"
│   │   └── plan-feature-list.tsx    ← 체크리스트
│   ├── about/                       ← v3.1 신규
│   │   ├── founder-hero.tsx         ← 다크 배경 + 포트레이트
│   │   ├── founder-quote.tsx        ← "AI는 자동차입니다..."
│   │   ├── expert-badges.tsx        ← EXPERT GUIDANCE / FAST DELIVERY
│   │   └── contact-form.tsx         ← 이름/연락처/요약/상세/예산/일정
│   ├── public/                      ← 공개 영역 공통
│   │   ├── project-card-public.tsx
│   │   └── demo-banner.tsx
│   ├── projects/
│   │   ├── project-card.tsx
│   │   ├── project-form.tsx
│   │   ├── project-status-badge.tsx
│   │   ├── kanban-view.tsx          ← @dnd-kit (Phase 2)
│   │   ├── list-view.tsx
│   │   ├── payment-timeline.tsx     ← 수금 미니 타임라인
│   │   └── publish-toggle.tsx       ← 공개 토글 (Phase 2)
│   ├── estimates/
│   │   ├── estimate-form-manual.tsx
│   │   ├── estimate-form-auto.tsx   ← 체크리스트
│   │   ├── estimate-form-ai.tsx     ← Phase 3
│   │   ├── estimate-item-row.tsx
│   │   ├── estimate-summary.tsx
│   │   └── estimate-pdf-template.tsx
│   ├── contracts/
│   │   ├── contract-form.tsx
│   │   └── contract-pdf-template.tsx
│   ├── invoices/
│   │   ├── invoice-card.tsx
│   │   ├── invoice-pdf-template.tsx
│   │   ├── payment-status-badge.tsx
│   │   └── tax-invoice-helper.tsx   ← 홈택스 링크 도우미
│   ├── dashboard/
│   │   ├── kpi-card.tsx
│   │   ├── revenue-chart.tsx
│   │   ├── client-pie-chart.tsx
│   │   ├── upcoming-payments.tsx
│   │   ├── activity-timeline.tsx
│   │   └── ai-briefing-card.tsx     ← Phase 3
│   ├── ai/                          ← Phase 3
│   │   ├── ai-draft-button.tsx
│   │   └── ai-draft-modal.tsx
│   ├── portal/                      ← Phase 4
│   │   ├── portal-header.tsx
│   │   └── portal-feedback-form.tsx
│   └── shared/
│       ├── data-table.tsx
│       ├── empty-state.tsx
│       ├── confirm-dialog.tsx
│       ├── currency-display.tsx     ← ₩1,000,000 포맷
│       ├── date-display.tsx
│       └── loading-skeleton.tsx
│
├── lib/
│   ├── db/
│   │   ├── schema.ts                ← Drizzle
│   │   ├── migrations/
│   │   └── queries/
│   │       ├── projects.ts
│   │       ├── estimates.ts
│   │       └── ...
│   ├── auth/
│   │   ├── middleware.ts
│   │   └── session.ts
│   ├── ai/                          ← Phase 3
│   │   ├── claude-client.ts
│   │   ├── estimate-prompt.ts
│   │   ├── report-prompt.ts
│   │   └── briefing-prompt.ts
│   ├── pdf/
│   │   ├── estimate-pdf.tsx
│   │   ├── contract-pdf.tsx
│   │   └── invoice-pdf.tsx
│   ├── estimate/
│   │   └── auto-calculator.ts       ← 자동 산정 로직
│   ├── webhooks/                    ← Phase 3
│   │   └── n8n-client.ts
│   ├── validation/
│   │   └── schemas.ts               ← Zod 스키마
│   └── utils/
│       ├── format-currency.ts
│       ├── generate-number.ts       ← 채번 (EST-2026-001)
│       ├── calculate-tax.ts         ← 부가세 계산
│       └── sample-data.ts           ← /demo용 샘플 데이터
│
├── types/
│   └── index.ts                     ← 전체 타입
│
└── middleware.ts                    ← 인증 미들웨어
```

---

## 13. 수익 모델

### Phase 1~3: 개인 사용 (Non-Revenue)
- Jayden 자신의 내부 도구
- 포트폴리오 가치 창출 (SI 수주 시 역량 증명)
- 비용: Supabase Free + Vercel Hobby + Claude API 소량 = **$0~10/월**

### Phase 4: 제한적 베타 (옵션)
- 신뢰할 수 있는 지인 프리랜서 3~5명에게 초대 코드 제공
- 무료 피드백 수집
- SaaS 전환 여부 판단 근거

### Phase 5+: Multi-tenant 전환 → [PRD v4.0 (docs/PRD-phase5.md)](./PRD-phase5.md) 참조

- **타이밍**: Phase 4 완료 직후 Phase 5.0 (Multi-tenant 기반, 🟡) 착수 → 지인 베타 2~3명(2주) → ~~Phase 5.5 (Billing, Stripe, 🔴)~~ ⛔ **폐기 2026-04-24**
- ~~**플랜 구성**: Free / Pro (15,000원/월) / Team (30,000원/멤버/월)~~ ⛔ **폐기**. 단일 고정 한도 정책으로 전환 (`src/lib/plans.ts` 단일 소스)
- ~~**결제 스택**: Stripe 우선 (토스페이먼츠는 Phase 5.6+ 한국 사용자 비중 확인 후)~~ ⛔ **폐기** (결제 도입 안 함)

> **v3.1 가격표(₩9,900/29,900) + "Jayden 3개월 실사용 후 결정" 조건은 v4.0으로 대체됨.** git log에서 확인 가능.
> **2026-04-24**: v4.0 Phase 5.5 Billing 자체도 취소됨. 본 섹션의 플랜/결제 언급은 역사 기록.

---

## 14. 리스크 & 제약사항

### 기술 리스크

| 리스크 | 영향 | 완화 전략 |
|--------|------|----------|
| PDF 생성 품질 | 견적서가 비전문적 → 고객 인식 저하 | 실제 고객 피드백 반영 + 한국 SI 템플릿 벤치마크 |
| 1인 → multi-tenant 전환 | `workspace_id` backfill + RLS 전면 재작성 리스크 | user_id FK 기반 설계 완료 → workspace_id 추가 마이그레이션 + backfill ([PRD v4.0](./PRD-phase5.md) R1/R2 + Phase 3 cron 선제 대비 완료) |
| 한국 세금 규정 변경 | 부가세율/양식 변경 가능 | 세금 로직 utils 분리 + 설정값 관리 |
| Claude API 비용 폭증 | AI 기능 남용 시 비용 증가 | 일일 호출 한도 (10회/일), Sonnet 사용 |
| n8n 서버 장애 | 알림/자동화 중단 | 핵심 기능은 직접 코드로 동작 + n8n은 "부가" |
| 모두싸인 API 중단 | 전자서명 불가 | PDF 수동 서명 → 업로드 폴백 |
| Supabase 장애 | 전체 서비스 중단 | 중요 데이터 주 1회 JSON 백업 |

### 시장 리스크

| 리스크 | 완화 |
|--------|------|
| 경쟁사 (Bonsai 한국 진출) 등장 | 한국 특화 기능 깊이로 차별화 (착수금/중도금/잔금, 세금계산서) |
| 프리랜서 시장 축소 | 개인 사용이 1차 목표이므로 시장 의존 낮음 |

### AI 리스크

| 리스크 | 완화 |
|--------|------|
| 견적 분해 환각 | 프롬프트 "입력된 요구사항에만 기반" 명시 + 사용자 검토 필수 |
| 주간 보고서 허위 정보 | 실제 마일스톤 데이터만 입력 + 사용자 검토 필수 |
| AI 비용 예측 불확실 | 일일 한도 + 월 사용량 모니터링 |

### 운영 리스크

| 리스크 | 완화 |
|--------|------|
| Jayden 단일 사용자 의존 | Phase 4 완료 후 Phase 5.0 multi-tenant 전환 → 지인 베타 2~3명 실사용 피드백으로 Phase 5.5 (Billing) 진입 여부 판단 ([PRD v4.0](./PRD-phase5.md)) |
| 랜딩 변경으로 기존 방문자 혼란 | 기존 톤 유지 + 요소 추가/수정만 |
| /demo 데이터 부족으로 인상 약함 | 샘플 데이터 풍부하게 구성 (6개월치) |

---

## 15. 완료 기준 (Definition of Done)

### 전체 프로젝트 완료 ("이 제품이 성공했다"의 정의)
- [ ] Jayden이 실제 SI 프로젝트 1건을 이 대시보드만으로 처음부터 끝까지 관리 완료
- [ ] 기존 노션/엑셀/카톡 대신 **이 대시보드만 열면 되는 상태**
- [ ] dairect.kr 랜딩에 "프로젝트 의뢰하기" CTA + 실제 문의 접수 동작
- [ ] /projects에 공개 프로젝트 3개 이상 자동 반영
- [ ] /demo에서 비로그인 사용자가 전체 기능 체험 가능

### Phase별 완료 기준

| Phase | 완료 기준 | 검증 |
|-------|----------|------|
| 0 | Google 로그인 → 빈 대시보드 → 로그아웃 | 수동 |
| 1 | 프로젝트 5개 + 고객 3개 + KPI 정확 반영 | 수동 |
| 2 | 견적서 → 계약서 → 인보이스 전체 플로우 완주 + 랜딩 업그레이드 + /projects 자동 반영 | 실제 고객 데이터로 테스트 |
| 3 | AI 견적 초안 + 주간 브리핑 + n8n Slack 알림 + 리드 CRM | Claude API + n8n 연동 |
| 4 | /demo + 고객 포털 + PWA 동작 | 외부 기기 접속 |
| 5 | (옵션) 다중 사용자 가입 + 결제 연동 | 베타 테스터 3명 |

### 매 Task 검증 게이트
```
1. tsc (타입 체크)
2. eslint
3. build
4. 수동 기능 테스트
→ 하나라도 실패 시 다음 Task 금지
```


---

# Part B. User Flow (사용자 플로우)

> 사용자가 어떤 경로로 시스템과 상호작용하는지를 정의합니다.

## B-1. 공개 방문자 플로우 (랜딩 첫 방문) — v3.1 시안 기반

```
[진입]
구글 검색 / SNS 링크 / 명함 QR / 위시켓 프로필 링크
  │
  ▼
[랜딩 도착] dairect.kr/
  Section 2 - Hero:
  - 뱃지 "AI-Powered Development"
  - 헤드라인 "머릿속 아이디어를 진짜로 만들어드립니다"
  - 부제 "개발을 모르셔도, AI를 못 다루셔도 괜찮습니다..."
  - 첫 인상 3초 판단
  │
  ├─ 분기 A: "나한테 맞는 서비스인가?" → 스크롤 계속
  │    │
  │    ▼
  │  Section 3 - 문제 정의 "이런 경험, 있으시죠?"
  │  - 견적서 보고 놀란 경험
  │  - AI 도구 앞에서 멍해진 경험
  │  - 아이디어만 쌓이는 서랍
  │  → 공감 유도 ("맞아, 내 얘기네")
  │    │
  │    ▼
  │  "그 서랍을 열어드리겠습니다" (감정 전환)
  │    │
  │    ▼
  │  Section 4 - 프로세스 "이렇게 진행됩니다"
  │  - 01 심층 상담 → 02 전략 설계 → 03 맞춤 개발 → 04 완성 및 이관
  │  → 투명성 확보 ("이렇게 하는구나")
  │    │
  │    ▼
  │  [내 아이디어도 가능할까? →] CTA 클릭
  │    → 섹션 7 하단 CTA로 스크롤
  │    │
  │    ▼
  │  Section 5 - 포트폴리오 프리뷰 (Top 3~4)
  │  → 실력 증명 ("진짜 만들 수 있구나")
  │    │
  │    ├─→ 각 카드 클릭 → /projects 또는 외부 라이브 URL
  │    │
  │    ▼
  │  Section 6 - 가격 프리뷰 (3패키지 요약)
  │  → 예산 가늠 ("30만원부터 시작할 수 있구나")
  │    │
  │    ├─→ "자세히 보기" → /pricing
  │    │
  │    ▼
  │  Section 7 - 하단 CTA "무엇을 고민하고 계신가요?"
  │    │
  │    ├─→ [💬 무료 상담 신청하기] 클릭 → /about Contact Form
  │    └─→ Footer 카카오톡 링크
  │
  ├─ 분기 B: Hero에서 바로 CTA
  │    └─ [내 아이디어 상담하기 →] → /about 문의 폼
  │    └─ [포트폴리오 보기] → /projects
  │
  ├─ 분기 C: Nav 메뉴 직접 이동
  │    ├─ 서비스 → /services (Phase 3)
  │    ├─ 포트폴리오 → /projects (시안 이미지 4)
  │    ├─ 가격 → /pricing (시안 이미지 3)
  │    └─ 소개 → /about (시안 이미지 6)
  │
  └─ 분기 D: 데모 체험
       └─ Nav "Dashboard" 드롭다운 → /demo (비로그인)
```

### 이탈 포인트 + 복구 전략

| 이탈 포인트 | 복구 |
|------------|------|
| Hero에서 3초 내 이탈 | 스탯 바를 Hero 내부에 배치 (즉시 신뢰) |
| 문제 정의 섹션에서 공감 실패 | 3카드 중 최소 1개는 반드시 공감되도록 다양한 페르소나 커버 |
| 가격 프리뷰에서 망설임 | 3패키지 + "30만원부터" 진입장벽 낮춤 |
| 폼 작성 중 이탈 | 이름/연락처만 필수, 나머지는 선택 |

---

## B-2. 신규 가입 플로우 (첫 로그인)

```
[진입] /login
  │
  ├─ 경로 A: 랜딩 → Nav → Dashboard
  ├─ 경로 B: /demo → "로그인" 배너
  └─ 경로 C: /dashboard 직접 접근 (리다이렉트)
  │
  ▼
[Google OAuth 버튼 클릭]
  │
  ▼
[Google 팝업] 계정 선택 + 권한 승인
  │
  ├─ 승인 → 다음 단계
  └─ 거절/닫음 → /login 에러 메시지
  │
  ▼
[콜백 처리]
  - users 테이블에 레코드 생성 (email, name, avatar_url)
  - user_settings 테이블에 기본값 INSERT
  - Supabase 세션 쿠키 발급
  │
  ▼
[온보딩 분기]
  user_settings.company_name IS NULL 여부 체크
  │
  ├─ NULL → [온보딩 위저드]
  │    │
  │    ▼
  │  [Step 1] 환영 메시지 + "5분만 설정하면 시작할 수 있어요"
  │  [Step 2] 회사 정보 입력 (상호, 대표, 사업자번호)
  │            └─ 나중에 하기 가능 (설정 페이지에서)
  │  [Step 3] 일 단가 확인 (기본 70만원, 조정 가능)
  │  [Step 4] 첫 프로젝트 등록 안내
  │    │
  │    ▼
  │  [대시보드 Overview] Empty State
  │    "아직 프로젝트가 없습니다" + [+ 첫 프로젝트 추가하기]
  │
  └─ 기존 사용자 → [대시보드 Overview] 직접 이동
```

### 온보딩 완료 기준
- 회사 정보 입력 (최소: 상호명)
- 첫 프로젝트 등록 (최소 1건)
→ 둘 다 달성 시 "온보딩 완료" 토스트 표시

---

## B-3. 프로젝트 생명주기 플로우 (Happy Path, 가장 중요)

```
[리드 수집]
  소스: 위시켓 / 크몽 / 랜딩 문의 폼 / 소개 / 직접 연락
  │
  ▼
[리드 등록]
  /leads → [+ 리드 추가] 모달
    - 이름, 연락처, 프로젝트 유형, 예산, 설명
    - status = 'new'
  │
  ▼
[상담 진행]
  리드 상세 → "상담 완료" 버튼
    - status = 'consulted'
    - 상담 메모 기록
  │
  ▼
[견적서 발행] (3가지 모드 중 선택)
  리드 상세 → [견적서 작성] 버튼
    │
    ├─ 모드 1: 수동 입력
    │   └─ 항목 직접 입력
    │
    ├─ 모드 2: 자동 산정 (권장)
    │   ├─ 기능 체크리스트에서 선택
    │   ├─ 실시간 합계 계산
    │   └─ 수금 계획 자동 분배
    │
    └─ 모드 3: AI 초안 (Phase 3)
        ├─ 요구사항 텍스트 입력
        ├─ Claude API → 항목 JSON 반환
        └─ 사용자 검토/수정
    │
    ▼
  [견적서 저장]
    - 채번: EST-2026-001
    - status = 'draft'
  │
  ▼
  [PDF 생성] → [이메일 발송 or 다운로드]
    - status = 'sent'
    - estimates.sent_at 기록
  │
  ▼
[견적 결과 분기]
  │
  ├─ 승인
  │    ├─ estimates.status = 'accepted'
  │    ├─ leads.status = 'estimated' → 'contracted'
  │    └─ 프로젝트 자동 생성 (leads → projects 전환)
  │         projects.status = 'contract'
  │
  └─ 거절
       ├─ estimates.status = 'rejected'
       ├─ leads.status = 'failed'
       ├─ leads.fail_reason 기록 (가격/일정/경쟁사/기타)
       └─ [끝]
  │
  ▼
[계약 체결]
  프로젝트 상세 → [계약서 생성]
    - 변수 자동 매핑 (프로젝트/고객/견적 금액)
    - 편집: 하자보수 기간, IP, 손해배상
    - PDF 생성
    - contracts.status = 'draft'
  │
  ▼
  [모두싸인 링크 붙여넣기] (선택) or [PDF 수동 서명 업로드]
    - contracts.status = 'signed'
    - contracts.signed_at 기록
  │
  ▼
[착수금 청구]
  계약 체결 즉시 자동 생성
    - invoices INSERT (type='advance', status='pending')
    - 청구서 PDF 생성
    - 고객에게 발송 (mailto:)
    - invoices.status = 'sent'
  │
  ▼
[착수금 입금 확인]
  Jayden이 통장 확인 → 수금 현황 페이지 [수금 확인] 버튼
    - invoices.status = 'paid'
    - invoices.paid_date 기록
    - projects.status = 'in_progress' (자동 전환)
  │
  ▼
[개발 진행]
  마일스톤 관리
    - 마일스톤 CRUD
    - 체크리스트 형태
    - 진행률 자동 계산
  │
  ├─ 마일스톤 50% 완료
  │    └─ 중도금 청구서 자동 생성 (Phase 2+ 규칙)
  │         └─ 이후 흐름 = 착수금과 동일
  │
  ▼
[검수]
  projects.status = 'review'
  고객 피드백 수집 (Phase 4: 고객 포털 피드백 폼)
  수정 반영
  │
  ▼
[납품 완료]
  projects.status = 'completed'
    - 잔금 청구서 자동 생성
    - 완료 확인서 생성 (Phase 3+)
    - warranty_end_date 자동 계산 (기본 3개월)
  │
  ▼
[하자보수 기간]
  projects.status = 'warranty'
  이 기간 동안 무상 버그 수정
  │
  ▼
[하자보수 종료]
  warranty_end_date 도래
    - projects.status = 'closed'
    - [포트폴리오 등록 제안] 대시보드 토스트
    - is_public 토글 ON → /projects 자동 반영
```

### 예외 경로

#### 견적 거절 시
```
estimates.status = 'rejected'
leads.status = 'failed', fail_reason 기록
→ 3개월 후 "리마인드 대상" 표시 (재접촉용)
```

#### 프로젝트 중도 취소 시
```
projects.status = 'cancelled'
→ 기 수령 금액 / 잔여 금액 자동 계산
→ 취소 사유 기록
→ 미발행 인보이스는 'cancelled' 처리
→ 정산 내역에 취소 기록 유지
```

#### 미수금 장기 미납 시
```
due_date 경과 후:
D+1:  invoices.status = 'overdue' 자동 전환 (일일 배치)
D+7:  대시보드 빨간 경고 배지
      n8n → 고객에게 리마인더 이메일 자동 발송 (Phase 3)
D+14: 2차 리마인더
      Jayden에게 Slack 알림
D+30: 프로젝트 상세 "미수금 경고" 배지 고정
      수금 현황 페이지 상단 하이라이트
```

---

## B-4. 견적서 작성 플로우 (모드별 세부)

### 모드 1: 수동 입력

```
/estimates/new 진입
  │
  ▼
[기본 정보]
  - 고객 선택 (드롭다운) or [+ 새 고객]
  - 프로젝트 선택 (선택사항)
  - 제목
  - 유효기한 (기본 30일)
  │
  ▼
[작성 모드 선택]
  ● 수동 입력 선택
  │
  ▼
[항목 테이블]
  [+ 항목 추가] 클릭 → 빈 행 추가
    - 기능명
    - 설명 (선택)
    - Man/Day
    - 단가
    - 수량
    - 소계 (자동 계산)
  [항목 삭제] 클릭 → 해당 행 제거
  항목 드래그 → 순서 변경
  │
  ▼
[합계 자동 계산]
  - 공급가액 = Σ 소계
  - 부가세 = 공급가액 × 10%
  - 총액 = 공급가액 + 부가세
  │
  ▼
[수금 계획 설정]
  - 착수금/중도금/잔금 비율 (기본 30/40/30, 조정 가능)
  - 비율 합계 = 100% 검증
  - 각 단계 예정일 설정
  │
  ▼
[저장]
  - 채번 (EST-2026-001)
  - status = 'draft'
  - 프로젝트 상세로 이동 or 목록으로 이동
```

### 모드 2: 자동 산정 (기본 권장)

```
/estimates/new 진입
  │
  ▼
[기본 정보] (동일)
  │
  ▼
[작성 모드 선택]
  ● 자동 산정 선택
  │
  ▼
[기능 체크리스트 표시]
  user_settings.feature_presets에서 로드
  카테고리별 그룹:
    [인증]    [프론트]    [백엔드]    [AI]
    [결제]    [연동]      [기타]
  │
  ▼
[기능 선택]
  각 기능 체크 시 실시간 계산:
    금액 = base_days × daily_rate × difficulty
  │
  ▼
[실시간 합계 표시]
  - 총 소요일
  - 공급가액 / 부가세 / 총액
  - 수금 계획 자동 분배
  │
  ▼
[커스터마이징 옵션]
  - 각 항목 클릭 → man_days/difficulty/unit_price 수정
  - "견적서로 변환" → 수동 입력 모드로 전환 (세밀한 편집)
  │
  ▼
[저장]
```

### 모드 3: AI 초안 (Phase 3)

```
/estimates/new 진입
  │
  ▼
[기본 정보]
  │
  ▼
[작성 모드 선택]
  ● 🤖 AI 초안 선택
  │
  ▼
[요구사항 입력]
  텍스트영역: "쇼핑몰을 만들고 싶어요. 회원가입, 상품 목록, 장바구니, 결제, 관리자 대시보드가 필요합니다."
  [AI 견적 생성] 버튼 클릭
  │
  ▼
[로딩]
  "AI가 견적을 분석 중... (10초 예상)"
  │
  ├─ 성공
  │   Claude API 호출 → JSON 항목 배열 반환
  │   → 체크리스트 자동 체크
  │   → 자동 산정 모드로 전환
  │   → 사용자 검토/수정
  │
  └─ 실패 (타임아웃, API 에러, 환각)
       "AI 생성 실패. 수동 입력으로 전환합니다"
       → 자동 산정 모드로 폴백
  │
  ▼
[검토 & 저장]
```

---

## B-5. 정산 플로우 (인보이스 → 입금 → 세금계산서)

```
[인보이스 자동 생성]
  트리거: 착수금 (계약 체결) / 중도금 (마일스톤 50%) / 잔금 (완료)
  │
  ▼
[인보이스 초기 상태]
  status = 'pending'
  issued_date = 오늘
  due_date = issued_date + 7일 (기본)
  │
  ▼
[청구서 발송]
  [PDF 생성] → [이메일 발송 (mailto:)]
    - status = 'sent'
    - sent_at 기록
  │
  ▼
[고객 입금 대기]
  │
  ├─ 기한 내 입금
  │   Jayden이 통장 확인 → [수금 확인] 버튼
  │     - status = 'paid'
  │     - paid_date 기록
  │     - paid_amount 기록
  │   │
  │   ▼
  │   [세금계산서 발행 도우미]
  │     - 공급자/공급받는자 정보 표시
  │     - 금액/부가세 표시
  │     - [홈택스 바로가기] 링크
  │   │
  │   ▼
  │   홈택스에서 수동 발행
  │     - invoices.tax_invoice_issued = true 체크
  │
  └─ 기한 초과 (미수금)
      D+1: status = 'overdue' 자동 전환 (일일 배치)
      D+7: 자동 리마인더 이메일 (Phase 3, n8n)
      D+14: 2차 리마인더
      D+30: 프로젝트 상세에 "미수금 경고" 고정
      Jayden 수동 처리 (전화/카톡)
```

---

## B-6. 고객 포털 접근 플로우 (Phase 5)

```
[Jayden] 프로젝트 상세 → [고객 포털 링크 생성]
  │
  ▼
[토큰 생성]
  portal_tokens INSERT
  expires_at = 1년 후
  URL: dairect.kr/portal/[token]
  │
  ▼
[링크 복사 or 이메일 발송]
  고객에게 전달
  │
  ▼
[고객] URL 접속
  │
  ▼
[토큰 검증]
  portal_tokens 조회
    ├─ 유효 → 진행
    ├─ 만료 → "링크가 만료되었습니다" 페이지
    └─ 없음 → 404
  │
  ▼
[고객 포털 뷰]
  - 프로젝트 이름 + 진행률 (%)
  - 마일스톤 체크리스트 (읽기 전용)
  - 납품물 링크
  - 이 프로젝트 건 인보이스 (본인 확인용)
  - 피드백 폼
  │
  ▼
[피드백 제출]
  portal_feedbacks INSERT
  Jayden 대시보드에 알림 (Phase 3: Slack)
  │
  ▼
[Jayden] 피드백 확인 → 대응 → 마일스톤 업데이트
```

---

## B-7. 랜딩 문의 제출 플로우 (v3.1: /about 폼 기반)

```
[방문자] 여러 진입 경로에서 /about Contact Form 도달
  진입 경로:
  - Hero [내 아이디어 상담하기 →]
  - 프로세스 섹션 [내 아이디어도 가능할까? →]
  - 하단 CTA [💬 무료 상담 신청하기]
  - Nav "소개" 메뉴
  - 포트폴리오 페이지 하단 [무료 상담 신청하기]
  │
  ▼
[About 페이지 진입]
  다크 Hero 섹션:
  - Jayden 포트레이트 + 소개
  - 인용문 "AI는 자동차입니다. 운전을 못해도 괜찮아요..."
  - EXPERT GUIDANCE / FAST DELIVERY 뱃지
  → 신뢰 확보
  │
  ▼
[폼 섹션 스크롤]
  제목: "내 아이디어, 만들 수 있을까?"
  부제: "편하게 말씀해주세요. 24시간 내 연락드립니다."
  │
  ▼
[폼 작성]
  필수:
  - 이름 *
  - 연락처 * (전화번호 또는 이메일)
  선택:
  - 아이디어 한줄 요약 (50자)
  - 상세 설명
  - 예산 범위 (라디오 4개)
  - 희망 일정 (라디오 3개)
  │
  ▼
[제출]
  POST /api/v1/public/inquiries
    - inquiries INSERT
    - status = 'new'
    - ip_address, user_agent 기록
    - 필수 검증 (이름, 연락처)
  │
  ▼
[서버 처리]
  - Jayden에게 이메일 알림 (Vercel 환경변수 + Resend/SendGrid)
  - n8n Slack 알림 (Phase 3)
  - (Phase 3) 리드 자동 생성:
      leads INSERT (source='landing_form', status='new', 관련 필드 복사)
      inquiries.converted_to_lead_id 업데이트
  │
  ▼
[응답]
  ├─ 성공:
  │   토스트 "문의가 접수되었습니다. 24시간 내 연락드리겠습니다."
  │   폼 초기화
  │   (선택) 카카오톡 채널 링크 표시 "더 빠른 답변을 원하시면..."
  │
  └─ 실패:
      토스트 "일시적 오류입니다. 카카오톡 상담을 이용해주세요"
      카카오톡 링크 강조
  │
  ▼
[Jayden 대응 플로우]
  - 이메일 확인 (or Slack)
  - 대시보드 /leads에서 문의 조회 (Phase 3)
  - 리드 상태: new → scheduled (상담 예약)
  - 카카오톡 or 전화로 1차 접촉 (24시간 내)
  - 상담 완료 → scheduled → consulted
  - 견적 발송 → consulted → estimated
  - 계약 → estimated → contracted → 프로젝트 자동 전환
```

---

# Part C. System Flow (시스템 플로우)

> 시스템 내부에서 데이터/요청이 어떻게 흐르는지를 정의합니다.

## C-1. 인증 플로우 (Google OAuth → JWT → RLS)

```
[Browser]
  사용자 "Google로 로그인" 클릭
  │
  ▼
[Next.js Route Handler]
  supabase.auth.signInWithOAuth({ provider: 'google' })
  → 리다이렉트 URL 생성
  │
  ▼
[Google OAuth Server]
  사용자 계정 선택 + 권한 승인
  │
  ▼
[Google] 콜백 URL로 리다이렉트
  /auth/callback?code=xxx
  │
  ▼
[Next.js Middleware]
  supabase.auth.exchangeCodeForSession(code)
  → JWT 토큰 발급
  → 쿠키 설정 (httpOnly, secure, sameSite)
  │
  ▼
[DB Trigger]
  첫 로그인 감지 (auth.users에 INSERT 발생)
  → handle_new_user() 함수 실행
    - public.users INSERT
    - public.user_settings INSERT (기본값)
  │
  ▼
[Browser] /dashboard 리다이렉트
  │
  ▼
[보호 라우트 접근 시]
  middleware.ts에서 세션 검증
    - 유효 → 통과
    - 무효/만료 → /login 리다이렉트
  │
  ▼
[DB 쿼리 시 RLS 자동 적용]
  auth.uid() = 현재 로그인 user_id
  → 모든 테이블 쿼리에 "WHERE user_id = auth.uid()" 자동 주입
  → 타 사용자 데이터 접근 불가
```

## C-2. 데이터 CRUD 플로우 (프로젝트 생성 예시)

```
[Browser]
  "프로젝트 생성" 버튼 클릭
  폼 제출
  │
  ▼
[Client Component]
  useMutation 호출
  POST /api/v1/projects
  Body: { name, client_id, expected_amount, ... }
  │
  ▼
[API Route Handler /api/v1/projects]
  1. 세션 검증 (supabase.auth.getUser())
     → 실패: 401 Unauthorized

  2. Zod 스키마 검증
     → 실패: 400 Bad Request + 에러 메시지

  3. Rate Limit 체크 (100req/분)
     → 초과: 429 Too Many Requests

  4. DB 삽입
     INSERT INTO projects (user_id, ...) VALUES (auth.uid(), ...)
     → RLS 자동 적용

  5. 활동 로그 기록
     INSERT INTO activity_logs (user_id, action, ...) VALUES (...)

  6. Supabase Database Webhook 자동 트리거 (Phase 3+)
     → n8n으로 'project.created' 이벤트 전송

  7. 응답
     201 Created + 생성된 레코드
  │
  ▼
[Client Component]
  - React Query 캐시 무효화
  - 토스트 "프로젝트가 생성되었습니다"
  - 프로젝트 목록 or 상세로 이동
```

## C-3. PDF 생성 플로우 (견적서)

```
[User Action]
  견적서 상세 → [PDF 다운로드]
  │
  ▼
[Client]
  POST /api/v1/estimates/[id]/pdf
  │
  ▼
[API Route]
  1. 세션 검증
  2. 견적서 조회 + 소유권 확인 (RLS)
  3. 관련 데이터 병합:
     - estimate (본문)
     - estimate_items (항목)
     - user_settings (공급자 정보)
     - client (공급받는자 정보)
     - project (프로젝트 정보)
  │
  ▼
[React PDF 서버 렌더링]
  import { pdf } from '@react-pdf/renderer';
  import EstimatePDFTemplate from '@/components/estimates/estimate-pdf-template';

  const blob = await pdf(<EstimatePDFTemplate data={data} />).toBlob();
  │
  ▼
[Supabase Storage 업로드]
  경로: /pdfs/estimates/{user_id}/{estimate_id}-v{version}.pdf
  public: false (토큰 기반 접근)
  │
  ▼
[estimates.pdf_url 업데이트]
  UPDATE estimates SET pdf_url = ... WHERE id = ...
  │
  ▼
[응답]
  200 OK + { signed_url: "..." }
  (1시간 유효한 signed URL)
  │
  ▼
[Browser]
  window.open(signed_url) → 다운로드 시작
```

### PDF 실패 시
```
React PDF 렌더링 에러
  ↓
서버 로그 기록 + Sentry (Phase 4+)
  ↓
응답: 500 Internal Server Error
  ↓
Client 토스트: "PDF 생성 실패. 다시 시도해주세요"
  ↓
폴백: HTML 인쇄 버전 표시 (window.print())
```

## C-4. AI 호출 플로우 (견적 초안 생성, Phase 3)

```
[User]
  요구사항 텍스트 입력 + [AI 견적 생성]
  │
  ▼
[Client]
  POST /api/v1/ai/estimate-draft
  Body: { requirements: "쇼핑몰을 만들고 싶어요..." }
  │
  ▼
[API Route]
  1. 세션 검증
  2. 일일 AI 호출 한도 체크 (기본 10회/일)
     → 초과: 429 + "일일 한도 초과"
  3. 요구사항 길이 검증 (100~2000자)
     → 범위 밖: 400
  4. Claude API 호출 준비:
     - 시스템 프롬프트: "당신은 IT 프리랜서 견적 분석가입니다..."
     - 제약: "입력된 요구사항에만 기반하여 분석하세요. 추측 금지"
     - 출력 형식: JSON 배열 { name, man_days, difficulty, category }
  │
  ▼
[Claude Sonnet 4.6 API]
  스트리밍 응답
  │
  ├─ 성공
  │   JSON 파싱 → 검증
  │   │
  │   ├─ 유효한 JSON → 반환
  │   └─ 파싱 실패 → "AI 응답 형식 오류" 에러
  │
  └─ 타임아웃 (30초)
      "AI 응답 지연. 수동 입력을 이용해주세요"
  │
  ▼
[응답]
  200 OK + { items: [...] }
  AI 호출 카운터 +1
  │
  ▼
[Client]
  - 자동 산정 모드로 전환
  - 반환된 항목을 체크리스트에 자동 체크
  - 사용자 검토 단계 필수 (경고 배너 표시)
```

## C-5. 포트폴리오 공개 반영 플로우

```
[Jayden]
  프로젝트 상세 → "공개" 토글 ON
  │
  ▼
[필수 필드 검증]
  - public_alias (공개용 이름)
  - public_description (한줄 설명)
  - public_tags (기술 태그)
  └─ 누락 시: 모달로 입력 유도
  │
  ▼
[선택 필드]
  - public_screenshot_url (스크린샷 업로드 → Supabase Storage)
  - public_live_url (외부 라이브 URL)
  │
  ▼
[DB 업데이트]
  UPDATE projects SET
    is_public = true,
    public_alias = ...,
    public_description = ...,
    public_tags = ...,
    public_screenshot_url = ...,
    public_live_url = ...
  WHERE id = ...
  │
  ▼
[공개 영역 자동 반영]
  Next.js ISR (Incremental Static Regeneration) 사용
    - /projects 페이지 revalidate
    - 1~2분 내 반영
  │
  ▼
[RLS 정책 활성화]
  "Public projects readable by anyone" 정책으로
  익명 사용자가 is_public=true 프로젝트 조회 가능
  │
  ▼
[/projects 페이지]
  공개 프로젝트 목록 업데이트
  Empty State → 실제 카드 렌더링
```

## C-6. 견적 자동 산정 계산 플로우

```
[Client]
  기능 체크 시마다 실시간 계산
  │
  ▼
[calculateEstimate() 함수]
  입력:
    - selectedFeatures: [{ name, base_days, difficulty, category }]
    - settings: { daily_rate, default_payment_split }

  처리:
    1. 각 기능별 단가 계산
       unit_price = base_days × daily_rate × difficulty

    2. 항목 배열 생성
       items = selectedFeatures.map(f => ({
         name, quantity: 1, unit_price, amount: unit_price
       }))

    3. 합계 계산
       subtotal = Σ items.amount
       tax = subtotal × 0.1
       total = subtotal + tax

    4. 수금 계획 분배
       milestones = payment_split.map(split => ({
         label: split.label,
         percentage: split.percentage,
         amount: Math.round(total × split.percentage / 100)
       }))
       마지막 단계에 나머지 할당 (반올림 오차 보정)

  반환:
    { items, subtotal, tax, total, totalDays, milestones }
  │
  ▼
[UI 업데이트]
  합계 + 수금 계획 실시간 표시
  │
  ▼
[저장 시]
  POST /api/v1/estimates
  서버에서 같은 계산 재수행 (신뢰 경계)
  → 결과 값 DB 저장
```

## C-7. 채번 플로우 (EST-2026-001, INV-2026-001)

```
[트리거]
  견적서/계약서/인보이스 생성 시
  │
  ▼
[generateNumber() 함수]
  type: 'estimate' | 'contract' | 'invoice'
  user_id: UUID

  쿼리:
    SELECT COALESCE(MAX(SUBSTRING(estimate_number FROM '\d+$')::int), 0) + 1
    FROM estimates
    WHERE user_id = $1
      AND estimate_number LIKE 'EST-2026-%'
      AND deleted_at IS NULL

  결과: 다음 번호 (예: 42)

  포맷:
    prefix = user_settings.estimate_number_prefix  -- 'EST'
    year = 현재 연도                                -- 2026
    seq = 번호.padStart(3, '0')                    -- '042'
    → 'EST-2026-042'
  │
  ▼
[동시성 처리]
  PostgreSQL UPSERT + UNIQUE 제약
  or SELECT ... FOR UPDATE (트랜잭션)
  → 중복 번호 방지
```

## C-8. 에러 핸들링 플로우

```
[요청 발생] (모든 API 공통)
  │
  ▼
[Layer 1: Middleware]
  - 세션 검증 실패 → 401
  - CORS 검증 실패 → 403
  - Rate Limit 초과 → 429
  │
  ▼
[Layer 2: Route Handler]
  - Zod 검증 실패 → 400 + { errors: [...] }
  - DB 제약 위반 → 409 Conflict
  - 리소스 없음 → 404
  - 소유권 위반 (RLS) → 403
  │
  ▼
[Layer 3: Business Logic]
  - 외부 API 실패 → 502 Bad Gateway
  - 타임아웃 → 504 Gateway Timeout
  - 일반 에러 → 500 Internal Server Error
  │
  ▼
[로깅]
  - 모든 5xx 에러 → Vercel 로그 + Sentry (Phase 4+)
  - 민감 정보 마스킹 (사업자번호, 계좌번호)
  - 사용자 ID, 요청 경로, 타임스탬프 기록
  │
  ▼
[에러 응답 포맷]
  {
    error: {
      code: 'VALIDATION_ERROR',
      message: '입력값을 확인해주세요',
      details: [{ field: 'name', message: '필수 항목입니다' }]
    }
  }
  │
  ▼
[Client 처리]
  - 400/422 → 폼 필드별 에러 표시
  - 401 → /login 리다이렉트
  - 403 → "권한이 없습니다" 토스트
  - 404 → 404 페이지
  - 429 → "잠시 후 다시 시도" 토스트
  - 5xx → "일시적 오류입니다" 토스트 + 재시도 버튼
```


---

# Part D. Operational Flow (운영 플로우)

> 시스템이 일상적으로 어떻게 작동하고 유지되는지를 정의합니다. 백그라운드 작업, 자동화, 배포, 장애 대응 포함.

## D-1. 일일 운영 플로우 (매일 자동 실행)

### 매일 00:00 KST — 자정 배치

```
[Vercel Cron Job: /api/cron/daily-midnight]
  실행 조건: 매일 00:00 KST (15:00 UTC)
  │
  ▼
[Task 1] 미수금 상태 업데이트
  UPDATE invoices
  SET status = 'overdue'
  WHERE status = 'sent'
    AND due_date < CURRENT_DATE
    AND paid_date IS NULL
  │
  ▼
[Task 2] 하자보수 기간 만료 체크
  UPDATE projects
  SET status = 'closed'
  WHERE status = 'warranty'
    AND warranty_end_date < CURRENT_DATE
  → 각 프로젝트: [포트폴리오 등록 제안] 알림 추가
  │
  ▼
[Task 3] 견적서 유효기한 만료
  UPDATE estimates
  SET status = 'expired'
  WHERE status = 'sent'
    AND valid_until < CURRENT_DATE
  │
  ▼
[Task 4] 포털 토큰 만료 처리
  DELETE FROM portal_tokens WHERE expires_at < now()
  │
  ▼
[로그]
  activity_logs에 배치 실행 기록
```

### 매일 09:00 KST — 업무 시작 알림

```
[Vercel Cron: /api/cron/morning-briefing] (Phase 3+)
  │
  ▼
[Task 1] 오늘의 작업 집계
  - 오늘 기한인 마일스톤 조회
  - 오늘 수금 예정 invoice 조회
  - 미수금 D+7, D+14 건 조회
  │
  ▼
[Task 2] Slack 알림 (n8n webhook)
  POST n8n endpoint
  Body: {
    type: 'morning_briefing',
    today_milestones: [...],
    payment_due: [...],
    overdue_alerts: [...]
  }
  │
  ▼
[n8n] Slack 메시지 발송
  "🌅 좋은 아침입니다 Jayden!
   오늘 마일스톤 2건 기한, 수금 예정 1건 (300만원)..."
```

### 매일 18:00 KST — 일일 마감

```
[Vercel Cron: /api/cron/daily-closing]
  │
  ▼
[Task 1] 오늘 활동 요약
  - 생성된 프로젝트 / 견적서 / 계약서 수
  - 입금 확인 건 + 금액
  - 완료된 마일스톤
  │
  ▼
[Task 2] 데이터 백업 체크
  - Supabase 자동 백업 상태 확인
  - 실패 시 Jayden에게 알림
```

## D-2. 주간 운영 플로우

### 매주 월요일 09:00 — 주간 계획

```
[/api/cron/weekly-monday]
  │
  ▼
[Task 1] 이번 주 예정 작업 집계
  - 이번 주 기한 마일스톤
  - 이번 주 수금 예정
  - 진행 중 프로젝트 상태 요약
  │
  ▼
[Task 2] AI 주간 브리핑 생성 (Phase 3)
  Claude API 호출
  입력: 위 집계 데이터
  출력: 3~5줄 요약 + "이번 주 집중할 것 3가지"
  │
  ▼
[Task 3] 대시보드 홈에 표시
  briefings 테이블 INSERT
  홈 접속 시 최신 브리핑 표시
```

### 매주 금요일 17:00 — 주간 보고서

```
[/api/cron/weekly-friday] (Phase 3)
  │
  ▼
[Task 1] 진행 중 프로젝트 조회
  status IN ('in_progress', 'review')
  │
  ▼
[Task 2] 프로젝트별 주간 보고서 초안 생성
  각 프로젝트:
    - 이번 주 완료 마일스톤
    - 다음 주 계획
    - 이슈/리스크
  Claude API 호출 → 마크다운 초안
  │
  ▼
[Task 3] Gmail로 Jayden에게 발송
  제목: "[주간 보고서 초안] {프로젝트명}"
  본문: 마크다운
  → Jayden이 검토 후 수정하여 고객에게 발송
```

### 매주 일요일 20:00 — 주간 회고

```
[/api/cron/weekly-sunday]
  │
  ▼
[Task 1] 이번 주 성과 집계
  - 완료된 마일스톤 수
  - 입금 금액
  - 신규 리드 수
  - 견적 승인/거절 수
  │
  ▼
[Task 2] 대시보드 "주간 회고" 위젯 업데이트
  다음 주 월요일 접속 시 표시
```

## D-3. 월간 운영 플로우

### 매월 1일 09:00 — 월간 정산

```
[/api/cron/monthly-first]
  │
  ▼
[Task 1] 지난달 매출 집계
  SELECT SUM(paid_amount)
  FROM invoices
  WHERE status = 'paid'
    AND paid_date BETWEEN '이전달 1일' AND '이전달 말일'
  │
  ▼
[Task 2] 월별 매출 차트 데이터 갱신
  대시보드 홈 Bar 차트에 반영
  │
  ▼
[Task 3] 세금계산서 발행 리마인더
  지난달 'paid'이지만 tax_invoice_issued = false 인 invoices
  → Jayden에게 "세금계산서 발행 필요 N건" 알림
```

### 매월 말 — 백업 검증

```
[수동 작업 or /api/cron/monthly-last]
  │
  ▼
[Task 1] Supabase 백업 점검
  - 자동 백업 7일치 존재 확인
  - 복구 테스트 (별도 환경)
  │
  ▼
[Task 2] JSON 내보내기 백업
  전체 테이블 JSON 덤프 → Supabase Storage
  경로: /backups/YYYY-MM.json
```

## D-4. n8n 자동화 워크플로우 (Phase 3)

### W1: 프로젝트 상태 변경 알림

```
[Trigger]
  Supabase Database Webhook
  Event: UPDATE on projects
  Condition: status 변경됨
  │
  ▼
[n8n Workflow 시작]
  Webhook 수신 → payload 파싱
  │
  ▼
[Switch 노드] status 값으로 분기
  │
  ├─ 'contract' (계약 체결)
  │   → Slack: "🎉 {프로젝트명} 계약 체결! 총 {금액}"
  │
  ├─ 'in_progress' (진행 시작)
  │   → Slack: "🚀 {프로젝트명} 개발 시작"
  │   → Google Calendar 이벤트 생성 (시작일~종료일)
  │
  ├─ 'completed' (완료)
  │   → Slack: "✅ {프로젝트명} 완료!"
  │   → 고객에게 만족도 설문 이메일 자동 발송 (1일 후)
  │
  └─ 'cancelled' (취소)
      → Slack: "⚠️ {프로젝트명} 취소. 사유 확인 필요"
  │
  ▼
[End]
```

### W2: 미수금 리마인더

```
[Trigger]
  Schedule: 매일 09:30 KST
  │
  ▼
[Supabase 쿼리]
  SELECT i.*, p.name as project_name, c.email as client_email
  FROM invoices i
  JOIN projects p ON i.project_id = p.id
  JOIN clients c ON p.client_id = c.id
  WHERE i.status = 'overdue'
    AND i.due_date = CURRENT_DATE - INTERVAL '7 days'
  │
  ▼
[IF 결과 있음]
  각 행마다:
    ├─ 고객 이메일 발송 (Gmail)
    │   제목: "[리마인더] {invoice_number} 청구서 입금 확인 요청"
    │   본문: 정중한 템플릿
    └─ Slack 알림 (Jayden)
        "💰 {프로젝트명} 미수금 D+7. 고객에게 리마인더 발송됨"
  │
  ▼
[End]
```

### W3: 랜딩 문의 → 리드 전환

```
[Trigger]
  Supabase Database Webhook
  Event: INSERT on inquiries
  │
  ▼
[즉시 알림]
  Slack: "📮 새 문의 도착: {이름} ({프로젝트_유형}, {예산})"
  │
  ▼
[자동 리드 생성]
  leads INSERT (source='landing_form', 관련 필드 복사)
  inquiries.converted_to_lead_id 업데이트
  │
  ▼
[환영 이메일 (선택)]
  고객에게 "문의 감사합니다" 자동 회신
  "24시간 내 Jayden이 직접 연락드립니다"
```

### W4: 프로젝트 완료 → 만족도 설문

```
[Trigger]
  Supabase Webhook: projects.status = 'completed'
  Delay: 1일 후 (완료 직후 피로감 고려)
  │
  ▼
[Google Form 설문 링크 생성]
  프로젝트 ID를 UTM으로 포함
  │
  ▼
[고객 이메일 발송]
  제목: "{프로젝트명} 함께해주셔서 감사합니다"
  본문: "5분이면 완료되는 짧은 설문입니다"
  링크: Google Form URL
  │
  ▼
[결과 수집 (Phase 4+)]
  Google Sheet → n8n → DB 저장
  대시보드 "고객 만족도" 위젯 표시
```

## D-5. 배포 플로우

### 일반 기능 배포 (Phase 1~5 공통)

```
[Local 개발]
  Claude Code로 Task 구현
  │
  ▼
[검증 게이트]
  1. npm run type-check (tsc)
  2. npm run lint (eslint)
  3. npm run build
  4. 수동 기능 테스트 (localhost:3000)
  → 하나라도 실패 시 배포 금지
  │
  ▼
[Git 커밋 + Push]
  feature/task-N-XXX 브랜치 → origin
  │
  ▼
[Vercel 자동 빌드]
  Preview URL 생성
  → Jayden이 Preview에서 테스트
  │
  ▼
[승인 후 main 머지]
  Pull Request → Review → Merge
  │
  ▼
[Production 자동 배포]
  main 브랜치 → dairect.kr 반영
  │
  ▼
[배포 후 확인]
  1. 홈 페이지 로드 정상
  2. 로그인 동작
  3. 주요 기능 smoke test
  → 이상 시 즉시 롤백 (Vercel "Promote to Production" 이전 배포)
```

### DB 마이그레이션 배포

```
[Drizzle 마이그레이션 생성]
  npx drizzle-kit generate
  → migrations/ 폴더에 SQL 파일 생성
  │
  ▼
[Preview 환경에서 먼저 실행]
  Supabase Preview 브랜치 활용 or
  별도 스테이징 프로젝트
  │
  ▼
[검증]
  - RLS 정책 정상 작동
  - 기존 데이터 영향 없음
  - API 라우트 타입 매칭
  │
  ▼
[Production 마이그레이션]
  npx drizzle-kit push
  → 즉시 적용
  │
  ▼
[롤백 계획]
  문제 발생 시:
  - DOWN 마이그레이션 스크립트 실행
  - Supabase Point-in-Time Recovery 사용
```

## D-6. 백업 & 복구 플로우

### 일상 백업

```
[자동]
  Supabase Pro: Point-in-Time Recovery (7일)
  자동 일일 백업 보관
  │
  ▼
[Free 플랜 한계]
  Phase 1~3 Free 사용 시:
  → 주 1회 수동 JSON 백업 필요 (/api/cron/weekly-backup)
  → Supabase Storage에 저장
```

### 장애 복구

```
[시나리오 A: 실수로 데이터 삭제]
  1. Supabase Dashboard → Database → Restore
  2. Point-in-Time 선택 (분 단위)
  3. 별도 브랜치로 복구
  4. 필요 데이터만 수동 복사

[시나리오 B: 전체 DB 손상]
  1. 가장 최근 백업 파일 확인
  2. 새 Supabase 프로젝트 생성
  3. 스키마 복구 (Drizzle push)
  4. 데이터 복구 (JSON → INSERT)
  5. DNS/환경변수 변경

[시나리오 C: Vercel 배포 장애]
  1. Vercel 이전 배포로 롤백 (Promote)
  2. 원인 파악 후 재배포
```

## D-7. 모니터링 플로우

### 에러 추적

```
[Phase 1~3: Vercel 기본 로그]
  Vercel Dashboard → Logs
  → 5xx 에러만 주 1회 점검
  │
  ▼
[Phase 4+: Sentry 연동]
  - 모든 에러 자동 수집
  - Slack 채널로 Critical 알림
  - 에러 빈도 대시보드
```

### 성능 모니터링

```
[Vercel Analytics]
  - Core Web Vitals (LCP, FID, CLS)
  - 페이지별 방문자 수
  - 지역/디바이스 분포
  │
  ▼
[목표 지표]
  - LCP < 2.5초
  - API 응답 < 500ms
  - PDF 생성 < 3초
  │
  ▼
[위반 시]
  - Vercel Edge Cache 활용 검토
  - DB 쿼리 최적화 (인덱스, EXPLAIN)
  - 이미지 lazy loading 점검
```

### AI 비용 모니터링

```
[Anthropic Console]
  일일/월별 사용량 조회
  │
  ▼
[예산 한도 설정]
  월 $20 한도 (Phase 3 기준)
  80% 도달 시 이메일 알림
  │
  ▼
[대시보드 내 추적]
  user_settings에 ai_usage_count 추가 (Phase 3)
  일 10회 초과 시 409 응답
```

## D-8. 장애 대응 플로우

### n8n 장애

```
[징후]
  Slack 알림 미수신 / 이메일 리마인더 미발송
  │
  ▼
[확인]
  1. Elest.io 콘솔에서 n8n 컨테이너 상태 확인
  2. 최근 Workflow 실행 로그 확인
  │
  ├─ 서버 다운
  │   Elest.io 재시작 버튼
  │
  ├─ Workflow 에러
  │   - Claude API 키 만료 체크
  │   - Webhook URL 변경 체크
  │   - 수동 재실행
  │
  └─ 해결 불가
      핵심 기능은 직접 코드로 동작하므로 서비스 지속
      알림 지연만 발생 (영업일 지연 허용)
  │
  ▼
[복구 후]
  놓친 알림 수동 전송 (optional)
```

### Claude API 장애

```
[징후]
  AI 견적/보고서 생성 실패
  │
  ▼
[확인]
  status.anthropic.com 확인
  │
  ├─ 전면 장애
  │   사용자 토스트: "AI 기능 일시 중단. 수동 입력을 이용해주세요"
  │   → 자동 산정 모드로 폴백
  │
  ├─ 속도 저하
  │   타임아웃 30초 → 60초 조정
  │
  └─ API 키 문제
      환경변수 확인 + 재발급
```

### Supabase 장애

```
[징후]
  로그인 불가 / DB 쿼리 실패
  │
  ▼
[확인]
  status.supabase.com 확인
  │
  ├─ 전면 장애
  │   서비스 전면 중단 (핵심 의존성)
  │   사용자 대시보드: "시스템 점검 중" 페이지
  │
  ├─ 특정 기능 장애 (Storage, Auth 등)
  │   해당 기능만 폴백 처리
  │   예: Storage 다운 → PDF 생성 불가 시 HTML 인쇄 대체
  │
  └─ 복구 후
      Point-in-Time Recovery로 데이터 손실 최소화
```

### PDF 생성 실패

```
[빈도]
  @react-pdf/renderer 메모리 이슈로 대용량 견적(항목 50개+) 실패
  │
  ▼
[폴백]
  1. 서버 재시도 (2회)
  2. 실패 시 → HTML 인쇄 버전 제공
     window.print() 또는 print.css 활용
  3. 근본 해결: puppeteer로 마이그레이션 고려
```

---

# Part E. 자체 검증 체크리스트

## E-1. 사용자 플로우 7대 체크

- [x] **인증/회원가입**: Google OAuth + 첫 로그인 자동 설정 (B-2)
- [x] **온보딩**: Empty State + 5분 내 첫 프로젝트 등록 (B-2)
- [x] **핵심 기능 플로우**: 리드 → 상담 → 견적 → 계약 → 진행 → 검수 → 완료 → 정산 (B-3)
- [x] **결제 플로우**: 인보이스 + 계좌이체 확인 (결제 PG 없음) (B-5)
- [x] **에러/엣지케이스**: Empty State 5종 + 견적 거절/취소/미수금 처리 (B-3)
- [x] **설정/프로필**: 설정 페이지 (회사 정보, 견적 기본값, 프리셋) (M-C2)
- [x] **알림**: n8n Slack/이메일 (Phase 3) (D-4)

## E-2. 시스템 플로우 7대 체크

- [x] **API 구조**: /api/v1/ RESTful + 모든 엔드포인트 정의 (섹션 11)
- [x] **인증/세션**: Supabase Auth JWT + RLS (C-1)
- [x] **외부 API 의존성**:
  - Claude API (AI) → 폴백: 수동 입력
  - 모두싸인 (전자서명) → 폴백: PDF 수동 업로드
  - n8n (자동화) → 폴백: 핵심 기능은 직접 코드
- [x] **보안**: RLS + Zod + Rate Limit + 암호화 컬럼 (섹션 9)
- [x] **에러 처리**: 3레이어 + 민감 정보 마스킹 (C-8)
- [x] **백그라운드 작업**: Vercel Cron (일일/주간/월간) + n8n (D-1~D-4)
- [-] **결제 웹훅**: 해당 없음 (결제 PG 미사용)

## E-3. AI 플로우 체크

- [x] **AI 입출력**: 견적 분해 (텍스트 → JSON), 보고서 (데이터 → 마크다운), 브리핑 (데이터 → 요약)
- [x] **모델 선택**: Claude Sonnet 4.6 (비용 효율)
- [x] **AI 실패 시**: 수동 입력 폴백 + 토스트
- [x] **환각 방지**: "입력된 요구사항에만 기반" 프롬프트 명시 + 사용자 검토 필수
- [x] **비용 추정**: 일 10회 한도 + 월 $20 예산 한도 + 80% 알림

## E-4. 운영 플로우 체크

- [x] **일일 운영**: 미수금/하자보수/견적 만료 자동 처리 (D-1)
- [x] **주간 운영**: 월요일 브리핑 / 금요일 보고서 / 일요일 회고 (D-2)
- [x] **월간 운영**: 매출 집계 + 세금계산서 리마인더 + 백업 (D-3)
- [x] **자동화**: n8n 워크플로우 4종 (W1~W4)
- [x] **배포**: Preview URL → 검증 → main 머지 (D-5)
- [x] **백업**: Supabase PITR + JSON 주간 백업 (D-6)
- [x] **모니터링**: Vercel Analytics + AI 비용 + 에러 추적 (D-7)
- [x] **장애 대응**: n8n/Claude/Supabase/PDF 각 시나리오 (D-8)

## E-5. Vibe Coding 호환성 체크

- [x] **Phase별 완료 기준 명확**: 각 Task마다 "완료 기준" 구체적 명시
- [x] **Not Doing 긍정문**: "이 Phase에서 X를 구현하지 않는다" 형태
- [x] **의존성 순서**: Phase 0 → 1 → 2 → 3 → 4 → 5 (각 Phase 헤더에 명시)
- [x] **구체성**: DB 스키마, API 라우트, 폴더 구조, 프롬프트 템플릿 모두 포함
- [x] **모호성 제거**: "두 명의 개발자가 같은 결과물을 만들 수 있는" 수준

## E-6. 기본 체크

- [x] **Empty State 정의**: 대시보드/칸반/고객/견적서/수금 각각 정의 (M-D 기능들)
- [-] **결제 실패 후 동선**: 해당 없음 (결제 PG 미사용)
- [x] **Mutable 데이터 하드코딩 없음**: 가격/일정/경쟁사는 설정값으로 관리

## E-7. 한국 시장 특화 체크

- [x] **한국어 전용**: 다국어 Not Doing 명시
- [x] **모바일 퍼스트**: 반응형 + PWA (Phase 4)
- [x] **카카오톡 연동**: SI 문의 섹션에 카카오 채널 링크
- [x] **KST 시간대**: 모든 Cron 09:00/17:00 KST 기준
- [x] **한국 SI 결제 구조**: 착수금/중도금/잔금 네이티브 지원
- [x] **세금계산서**: 홈택스 바로가기 + 필요 정보 자동 표시
- [x] **한글 폰트**: Noto Sans KR / Noto Serif KR (기존 유지)

---

# 부록

## 부록 A: 디자인 참조 문서 (v3.1 업데이트)

**⚠️ 중요: Single Source of Truth**

```
/Users/jayden/project/dairect/docs/design-references/redesign-2026/
├── DESIGN.md                           ← "The Intelligent Sanctuary" 디자인 시스템
├── (HTML 파일들)                        ← Jayden 확인: 폴더 내 HTML 전체 참조 필수
├── 1776333939229_screen.png            ← 랜딩 메인 (Hero)
├── 1776334105246_screen.png            ← 랜딩 메인 (Hero, 동일본)
├── 1776334422321_screen.png            ← Process 페이지 "이렇게 진행됩니다"
├── 1776334430077_screen.png            ← 문제 정의 "이런 경험, 있으시죠?"
├── 1776334441851_screen.png            ← Pricing 페이지 (3패키지)
├── 1776334451960_screen.png            ← Projects 페이지 "이런 걸 만듭니다"
├── 1776334467338_screen.png            ← Footer 디자인 상세 (다크)
├── 1776334475828_screen.png            ← About 페이지 (Jayden 소개 + 문의 폼)
└── 1776334484298_screen.png            ← 랜딩 메인 (Hero, 동일본)
```

**참조 우선순위:**
1. DESIGN.md (디자인 시스템 토큰 + 철학)
2. HTML 파일 (실제 구현 예시 — 있다면 복붙 가능한 수준)
3. 이미지 7장 (최종 시각 확인)

**글로벌 design-system.md 관계:**
- 글로벌 규칙은 이 프로젝트에 적용하지 않음
- 단, 보편 원칙(비대칭 레이아웃, 순차 등장, 호버 효과 등)은 여전히 지향
- 충돌 시 **항상 로컬 DESIGN.md 우선**

**별도 플로우 참조:** `Dairect-Flow-for-Designer.md` (이전 작성)
- 디자인 요구사항 제외, 순수 플로우만
- 이 PRD v3.1의 Part B~D와 교차 참조

## 부록 B: 한국 SI 결제 구조 참고

### 착수금/중도금/잔금 표준 비율

| 패턴 | 착수금 | 중도금 | 잔금 | 적합 프로젝트 |
|------|--------|--------|------|-------------|
| 3-4-3 | 30% | 40% | 30% | **기본값** — 500만원+ 프로젝트 |
| 4-3-3 | 40% | 30% | 30% | 초기 비용 큰 프로젝트 |
| 3-3-4 | 30% | 30% | 40% | 검수 비중 큰 프로젝트 |
| 5-5 | 50% | — | 50% | 소규모 단기 (300만원 이하) |
| 2-3-3-2 | 20% | 30% | 30% | 1,000만원+ 대형 (마일스톤 2개) |

### 세금계산서 필수 기재 항목

```
1. 공급자 정보
   - 사업자등록번호
   - 상호
   - 성명 (대표자)
   - 주소
2. 공급받는자 정보
   - 사업자등록번호
   - 상호
3. 작성일자
4. 공급가액 / 부가세
5. 품목, 규격, 수량, 단가, 금액
```

→ 이 정보를 인보이스에서 자동 추출하여 "세금계산서 발행 도우미" 화면에 표시
→ Jayden은 홈택스 링크 클릭 후 수동 입력 (자동 발행 X)

## 부록 C: Phase별 예상 비용

### Phase 1~3 (개인 사용, Free 티어)

| 항목 | 비용 |
|------|------|
| Supabase Free | $0 |
| Vercel Hobby | $0 |
| Claude API (일 10회 한도) | ~$5/월 |
| 도메인 (dairect.kr) | 이미 보유 |
| n8n (Elest.io) | ~$7/월 |
| **합계** | **~$12/월** |

### Phase 4 (베타)

| 항목 | 비용 |
|------|------|
| Supabase Pro | $25/월 |
| Vercel Pro | $20/월 |
| Claude API | ~$20/월 |
| n8n | $7/월 |
| Sentry (에러 추적) | $26/월 |
| **합계** | **~$98/월** |

### Phase 5 (SaaS 전환 시)

| 항목 | 비용 |
|------|------|
| 위 Phase 4 인프라 | $98/월 |
| TossPayments 수수료 | 매출의 2.8%~3.3% |
| 이메일 발송 (SendGrid) | ~$15/월 |
| 스토리지 추가 | ~$10/월 |
| **고정비** | **~$125/월 + 수수료** |

---

*— End of PRD v3.1 —*
*문서 버전: 3.1 (리브랜딩 반영판)*
*최종 수정: 2026-04-16*
*Pre-requisites:*
*  - dairect_si_portfolio.md (Portfolio #3)*
*  - /Users/jayden/project/dairect/docs/design-references/redesign-2026/ (DESIGN.md + HTML + 이미지 7장)*
*  - Dairect-Flow-for-Designer.md (별도 플로우 문서)*

---

# 부록 D: Changelog (v3.0 → v3.1)

## 변경 요약

| 영역 | v3.0 | v3.1 |
|------|------|------|
| **디자인 시스템** | 글로벌 design-system.md (웜 골드, Newsreader 세리프) | 로컬 DESIGN.md "The Intelligent Sanctuary" (Indigo, DM Sans + Pretendard) |
| **브랜드 슬로건** | Hero 메인 "코드는 AI가, 방향은 내가" | Footer 유지 (DNA 보존), Hero는 신규 카피 |
| **Hero 헤드라인** | "코드는 AI가, 방향은 내가" | "머릿속 아이디어를 진짜로 만들어드립니다" |
| **Primary CTA** | "프로젝트 의뢰하기 →" | "내 아이디어 상담하기 →" |
| **Nav 메뉴** | 소개/디렉팅/쇼케이스/프로덕트 | 서비스 / 포트폴리오 / 가격 / 소개 |
| **공개 페이지** | /, /projects, /demo | /, /services, /projects, /pricing, /about, /demo |
| **/pricing** | 없음 | 🆕 3패키지 (진단 30만원~/MVP 100만원~/확장 300만원~) |
| **/about** | 없음 (랜딩 내 섹션) | 🆕 전담 페이지 (Jayden 포트레이트 + 상세 문의 폼) |
| **문의 폼 필드** | 이름/이메일/유형/예산/설명 | 이름/연락처/한줄요약/상세/예산(라디오 4)/일정(라디오 3) |
| **Phase 2 소요일** | 5일 | 7일 (+2일, Task 2-8 리브랜딩) |
| **전체 일정** | 20~23일 | 22~25일 |
| **대상 언어** | "Vibe Architect" (Hero 노출) | 비개발자 친화 ("개발 모르셔도"), Vibe Architect는 /about만 |
| **그림자 규칙** | 일반 drop shadow | Ambient Tonal (다층 + on_surface 틴트) |
| **테두리** | 1px border 허용 | No-Line Rule (배경 톤 전환만) |

## 구체적 변경 항목

### Part A. PRD 본문

1. **문서 헤더** — 버전 3.0 → 3.1, 통합 출처에 리브랜딩 시안 + DESIGN.md 추가
2. **섹션 1 Executive Summary** — 배경 재작성 (브랜드 방향 전환 명시)
3. **섹션 3 이중 구조 아키텍처** — 사이트맵에 /services, /pricing, /about 추가. 디자인 시스템 참조 경로 명시
4. **섹션 6 M-P1 랜딩페이지** — "업그레이드" → "리브랜딩 전면 개편". 8섹션 구성 상세 명세 (Nav/Hero/문제정의/프로세스/포트폴리오/가격/CTA/Footer)
5. **섹션 6 M-P2 /projects** — 시안 이미지 4 기반 Bento Grid 비대칭 + "이런 걸 만듭니다" 카피
6. **섹션 6 M-P3 /pricing** 🆕 — 시안 이미지 3 기반 3패키지 (진단/MVP 중앙 강조/확장)
7. **섹션 6 M-P4 /about** 🆕 — 시안 이미지 6 기반 Jayden 소개 + 상세 문의 폼
8. **섹션 6 M-P5 /demo** — v3.0 유지 (변경 없음)
9. **섹션 7 Not Doing** — 랜딩 "리디자인 금지" 조항 제거. 대신 Newsreader/웜골드 금지, 1px 테두리 금지, 순수검정 금지, 영문 Nav 금지, Vibe Architect 메인 노출 금지 등 11개 항 신규
10. **섹션 8 Phase 2** — Task 2-8 "랜딩 업그레이드(1일)" → "랜딩+공개 페이지 리브랜딩(3일)". Day1 토큰+폰트+공통, Day2 랜딩 메인 7섹션, Day3 공개 4페이지
11. **섹션 10 DB 스키마** — `inquiries` 테이블 확장 (contact, idea_summary, budget_range enum 4종, schedule enum 3종)
12. **섹션 12 폴더 구조** — landing/ 재정비 (8개 섹션 컴포넌트) + pricing/ + about/ 신규

### Part B. User Flow

13. **B-1 공개 방문자 플로우** — 시안 7섹션 기반으로 전면 재작성. 진입 → Hero → 문제 정의(공감) → 프로세스(투명성) → 포트폴리오(실력) → 가격(예산) → CTA의 심리적 여정 서술
14. **B-7 문의 제출 플로우** — /about 페이지 상세 폼 기반으로 재작성. 다크 Hero(신뢰) → 연보라 폼(편안함) 심리 흐름 반영

### 부록

15. **부록 A 디자인 참조** — 새 경로 + 이미지 7장 파일명 목록 + 참조 우선순위 (DESIGN.md > HTML > 이미지)
16. **부록 D Changelog** 🆕 — 이 섹션 (v3.0 → v3.1 변경 이력)

## 유지된 것 (변경 없음)

- 섹션 4 타겟 사용자 (페르소나) — Primary 현우/Secondary 수진/Tertiary 방문자 유지
- 섹션 5 목표 & 성공 지표 — 비즈니스/사용자/방문자/포트폴리오 Outcome 유지
- 섹션 6 M-D1~M-D9 대시보드 Must Have 전체 — 대시보드 시안이 없어 로직 유지
- 섹션 6 S-D1~S-D6 Should Have — Phase 3 기능 유지
- 섹션 6 C-D1~C-D4 Could Have — Phase 4~5 기능 유지
- 섹션 9 기술 스택 — 코어 스택(Next.js 16.2, Supabase, Drizzle, Claude Sonnet) 유지
- 섹션 10 DB 스키마 (inquiries 외) — users/clients/projects/estimates/contracts/invoices 전부 유지
- 섹션 11 API 라우트 구조 — 전부 유지
- 섹션 13 수익 모델 — SaaS 전환 시나리오 유지
- 섹션 14 리스크 — 전부 유지
- 섹션 15 완료 기준 — 전부 유지
- Part C 시스템 플로우 — 전부 유지 (C-1~C-8)
- Part D 운영 플로우 — 전부 유지 (D-1~D-8)
- Part E 자체 검증 체크리스트 — 전부 유지

## 오픈 이슈 (v3.1 이후 결정 필요)

| # | 이슈 | 결정 필요 시점 |
|---|------|-------------|
| 1 | /services 페이지 콘텐츠 확정 (시안 없음) | Phase 2 Day 3 전 |
| 2 | /about 슬로건 "AI는 자동차입니다..." 인용 확정 vs 변경 | Phase 2 Day 3 전 |
| 3 | Hero 3D 기기 목업 이미지 소스 (시안 이미지 vs 실제 대시보드 스크린샷) | Phase 2 Day 2 전 |
| 4 | 대시보드 내부 페이지 디자인 시안 (현재 미공급) | Phase 1 전 |
| 5 | /pricing에 견적 자동 산정기 연동 여부 (대시보드 feature_presets 기반 예상 견적 계산) | Phase 3 전 |
| 6 | Footer 사업자등록번호/대표명 실제 값 (시안은 placeholder) | Phase 2 Day 3 전 |

---

*— Changelog End —*

