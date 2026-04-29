# Dairect 다음 단계 계획서

> 작성일: **2026-04-29**
> 작성 시점 컨텍스트: Journal & Build 기획 + 옵시디언 셋업 직후
> 관련 문서:
> - [PROGRESS.md](../PROGRESS.md) — 진행 현황 (3441줄, 매우 길어 PROGRESS-INDEX.md 분리 필요할 수도)
> - [PRD-v3.2-single-user.md](./PRD-v3.2-single-user.md) — 1차 1인 사용 모드 정의
> - [PRD-journal-build.md](./PRD-journal-build.md) — Journal & Build 기획안 (이번 세션)
> - [obsidian-user-manual.md](./obsidian-user-manual.md) — 옵시디언 사용 매뉴얼
> - [learnings.md](./learnings.md) — 누적 교훈

---

## 1. 한 장 요약 (Executive Summary)

### 프로젝트 정체성 (변하지 않음)
- **이중 구조**: 공개 영역(랜딩·포트폴리오·문의) + 비공개 대시보드(PM CRM·견적·계약·정산)
- **타겟**: 직장인·소규모 사업자(잠재 고객) + Jayden 본인(PM 작업)
- **수익 모델**: SI 개발 대행 수주 (구독 SaaS 아님 — v3.2에서 취소)

### 현재 위치
- 핵심 기능 100% 동작 → 본격 영업 단계
- **활성화 단계 (Activation phase)**: 만든 시스템을 실제 사용해 매출·신뢰 누적

### 이번 세션 추가
- Journal & Build 콘텐츠 시스템 **기획 완료** (구현 미시작)
- 옵시디언 셋업 완료 (양방향 동기화 + 템플릿)

---

## 2. 작업 분류 — 우선순위 매트릭스

### 🔴 P0: 매출·운영 직격 (즉시 점검)

| # | 항목 | 영향 | 추정 시간 |
|---|------|------|----------|
| 1 | **랜딩 "상담 신청하기" → leads 자동 INSERT 검증** | 매출 누락 리스크 (수기 입력 필요 시 영업 전환율 ↓↓) | 1시간 |
| 2 | Vercel 배포 결과 직접 브라우저 확인 (모바일·데스크톱) | 프로덕션 방치 시 잠재 고객 이탈 | 30분 |

비유: **상담 폼이 새는 깔때기인지 확인하는 작업** — 매출의 입구가 새고 있으면 다른 작업 무의미.

### 🟡 P1: PRD v3.2 잠금 작업 (1주 내)

| Task | 무엇 | 상태 |
|------|------|------|
| Task-S2a | plan 차등 제거 + AI 한도 단일화 | 미완 |
| Task-S2b | `/signup` + `/onboarding` + Workspace picker UI 잠금 | 미완 |
| Task-S2c | `/invite/[token]` 라우트 잠금 | 미완 |
| Task-S2d | `/pricing` 삭제 + `PricingSummarySection` 제거 | ⚠️ /pricing은 v9에서 신설됐으므로 PRD v3.2와 충돌 — **재검토 필요** |
| Task-S2e | `/dashboard/members` 본인 접근 가드 강화 | 미완 |
| Task-S2f | PRD/PROGRESS 1차 완료 기준 갱신 | 미완 |
| Task-S2g | Jayden dogfooding 체크리스트 작성 | 일부 (`docs/dogfooding-checklist.md`) |

⚠️ **Task-S2d 충돌**: PRD v3.2는 "/pricing 삭제"였으나, 2026-04-27 세션에서 /pricing 신규 페이지가 만들어짐 (4 패키지 v9). PRD를 v3.3으로 갱신하거나 /pricing의 의미 재정의 필요.

### 🟢 P2: 정리·개선 (2주 내)

| # | 항목 | 비고 |
|---|------|------|
| 1 | 미사용 7 컴포넌트 정리 | Etymology, Manifesto, WhyThisWorks 등 (Phase B 분리 후 import만 제거됨) |
| 2 | OG 이미지 페이지별 분기 | 현재 `/` 하나만 — /pricing, /process, /about, /journal 별도 필요 |
| 3 | Hero H1 카피 재검토 | "비전문가가 무슨 서비스인지 잘 이해 못 한다" 피드백 |
| 4 | /about 합병 검토 | 정보 분산 vs 단일 페이지 트레이드오프 |
| 5 | PROGRESS.md 분할 | 3441줄 → 월별 분할 (PROGRESS-2026-04.md 등) |

### 🔵 P3: 신규 Epic — Journal & Build Phase 1 (3~5일)

이번 세션 기획 완료, 구현 대기. [PRD-journal-build.md Section 8](./PRD-journal-build.md#8-다음-단계-task-분해) 참고.

| # | Task | 추정 |
|---|------|------|
| 1 | Build 첫 사이드 프로젝트 결정 (대화) | 1시간 |
| 2 | 시드 콘텐츠 5개 (Journal 3 + Build 2) — 옵시디언에서 작성 | 2~3시간 |
| 3 | Next.js MDX 파이프라인 구현 (`gray-matter` + `generateStaticParams`) | 1일 |
| 4 | 카드·리스트 컴포넌트 (Studio Anthem 톤) | 1일 |
| 5 | 홈 임베드 섹션 ("Latest from Journal" + "What I'm Building") | 0.5일 |
| 6 | 메뉴(Build) + 푸터(Journal) 노출 | 0.5일 |
| 7 | 이미지 처리 파이프라인 (`attachments/` 매핑) | 0.5일 |
| 8 | 셋업 가이드 문서 정리 (Obsidian Git → Claude push 방식) | 0.5시간 |

### ⚪ P4: 미래 Epic — 별도 시작 트리거 필요

| Epic | 무엇 | 트리거 |
|------|------|--------|
| **Lightweight Admin v1** | 옵시디언 없는 기기에서 글 작성 | Phase 1 안정화 + "옵시디언 없는 기기 작성 빈도 월 2회 이상" 확인 후 |
| **2차 확장 (다른 프리랜서)** | Workspace picker 활성화 + signup 복원 | Jayden 본인 dogfooding 6개월 + 명확한 요청 발생 시 |
| **PROGRESS.md 인덱스화** | 월별 분할 + 검색용 인덱스 | 50KB 더 늘어나면 |

---

## 3. 신규 발견 이슈 (이번 세션에서 식별)

### 3-1. PROGRESS.md 비대화
- 현재 280KB / 3441줄 → **읽기 도구 256KB 한계 초과**
- Claude가 한 번에 못 읽음 → AI 보조 작업 효율 ↓
- **권장**: `PROGRESS-2026-04.md`, `PROGRESS-2026-Q1.md` 식 월·분기별 분할 + `PROGRESS.md`는 인덱스화

### 3-2. PRD 일관성 ⚠️
- PRD v3.2는 `/pricing` 삭제 명시
- 실제로는 v9에서 `/pricing` 신설 (4 패키지)
- → **PRD v3.3 갱신 또는 명시적 ADR 필요**

### 3-3. learnings.md 누적
- 2026-04 기간 동안 100+ 개 교훈 추가됨 (PROGRESS.md tail 확인)
- 정리·우선순위화 안 되면 "있어도 못 찾는 자산"화

### 3-4. 옵시디언 셋업의 미해결
- 가이드 문서(obsidian-publishing-setup.md) Step 3은 Obsidian Git 플러그인 사용으로 적힘
- 실제 결정은 Claude push 방식 → **가이드 정리 필요** (P3 Task #8)

---

## 4. 큰 그림 로드맵 (Q2 2026)

```
4월 [완료]    랜딩 v9 슬림화 + /pricing /process + 가이드 + Chatsio 정정
              Journal & Build 기획 + 옵시디언 셋업
              ─────────────────────────────────────
4월 末       🔴 P0: 상담 폼 leads INSERT 검증 + Vercel 확인
5월 1주차    🟡 P1: PRD v3.2 잠금 작업 마무리 (S2a~g)
              + 🟢 P2: 미사용 컴포넌트 정리, OG 이미지
5월 2~3주차  🔵 P3: Journal & Build Phase 1 구현 + 첫 글 발행
              ─────────────────────────────────────
6월         시드 콘텐츠 누적 + Build 첫 프로젝트 진행
            ⚪ Lightweight Admin v1 검토 (트리거 충족 시만)

7월~        2차 확장 검토 (dogfooding 6개월 데이터 기반)
```

---

## 5. 의사결정 필요 항목

다음 작업 진행 전 Jayden 결정 필요:

### 5-1. 즉시 결정
| # | 항목 | 옵션 |
|---|------|------|
| A | **P0(상담 폼 검증)을 지금 진행할까?** | 즉시 / 다음 세션 |
| B | **Journal & Build Phase 1을 언제 시작?** | P1 잠금 후 / 병렬 / 다른 우선순위 |
| C | **Build 첫 사이드 프로젝트** | 어떤 아이디어로 시작? |

### 5-2. 1주 내 결정
| # | 항목 | 옵션 |
|---|------|------|
| D | **PRD v3.2 → v3.3 갱신** | /pricing 의미 재정의 + ADR 작성 |
| E | **PROGRESS.md 분할 시점** | 지금 / Phase 1 끝나고 |
| F | **learnings.md 정리·태그화** | Claude가 자동 분류 / Jayden 수동 검토 |

### 5-3. 1개월 내 결정
| # | 항목 | 옵션 |
|---|------|------|
| G | **Obsidian 라이선스** | Personal 무료 / Commercial $50/년 |
| H | **모바일 동기화 방안** | Obsidian Sync $5/월 / git clone 별도 |

---

## 6. 검증 게이트 (모든 Task 완료 시 통과 필수)

```bash
# 글로벌 CLAUDE.md 검증 명령
pnpm tsc --noEmit && pnpm lint && pnpm build && pnpm db:check
```

추가:
- `pnpm test` (있는 경우)
- 보안 민감 변경 시 `security-reviewer` 에이전트 호출
- 프로덕션 배포 전 Vercel preview URL 직접 브라우저 확인

---

## 7. 권장 진행 순서 (이번 주)

```
[Day 1 — 오늘]
├─ ✅ Journal & Build 기획 + 옵시디언 셋업 (완료)
└─ 🔴 P0-1: 상담 폼 leads INSERT 검증 (1시간)

[Day 2~3]
├─ 🟡 P1: Task-S2a~e (PRD 잠금 작업)
└─ 🟢 P2-2: OG 이미지 페이지별 분기

[Day 4~5]
├─ 🟡 P1: Task-S2f (PRD 갱신 — v3.3 또는 ADR)
└─ 📚 PROGRESS.md 분할 (선택)

[다음 주]
└─ 🔵 P3: Journal & Build Phase 1 시작
   ├─ Build 첫 사이드 프로젝트 결정
   ├─ 시드 콘텐츠 5개 작성
   └─ Next.js 파이프라인 구현
```

비유: **재고 정리(P0~P1) → 매장 정돈(P2) → 신상품 출시(P3)**. 매장이 흐트러진 상태에서 신상품 내면 둘 다 효과 떨어짐.

---

## 8. 한 줄 정리

> **"매출 누설 점검 → PRD 일관성 복구 → Journal/Build 발행"** 순서로 진행. 옵시디언 + Build 콘텐츠는 매출의 신뢰 자산이지만, P0 매출 직격 이슈가 우선.

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-29 | 최초 작성 (Journal & Build 셋업 직후) |
