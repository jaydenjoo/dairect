# PRD — Journal & Build

> Dairect 공개 영역 콘텐츠 시스템 기획안
> 작성일: 2026-04-29
> 상태: 기획 확정 / 구현 대기

---

## 1. 개요

방문객(직장인·소규모 사업자)에게 Jayden의 사고·진행 상황을 **짧고 자주** 공유하는 콘텐츠 시스템.

- **Journal**: 일상 인사이트, 도구 추천, 짧은 단상
- **Build**: 자체 사이드 프로젝트 진행 로그 (build in public)

비유: **Build는 진열창의 작업 모습, Journal은 안쪽 매거진 코너**. 둘 다 "이 사람 살아있다 + 신뢰할 만하다"는 신호를 만든다.

### 왜 만드는가
1. 진정성 신호 — 잠재 고객이 의뢰 검토 시 "이 사람 어떻게 일하나" 확인
2. 자연스러운 영업 — "저도 이런 거 만들고 싶어요" 식 의뢰 유입
3. 재방문 유도 — 신선도가 살아있는 사이트
4. Dairect 가치 제안(아이디어→검증)을 본인이 직접 실연

---

## 2. 결정 사항 요약

| 항목 | 결정 |
|------|------|
| 콘텐츠 유형 | 짧고 자주 (200~500자 노트 + 빌드 로그) |
| 페이지 구조 | `/journal` + `/build` 분리 |
| 노출 위치 | 홈 임베드(Latest 3개) + 푸터 + Build만 상단 메뉴 |
| 아이디어 공개 수준 | 방향성 + 화면 스크린샷까지. 핵심 로직·DB·프롬프트는 비공개 |
| 디자인 톤 | Studio Anthem (매거진 저널 스타일) |
| 콘텐츠 저장 | **옵시디언 → Git 플러그인 → MDX** ⭐ |
| Build 첫 프로젝트 | 별도 사이드 프로젝트 (미정) |
| 시드 콘텐츠 | 미준비 (셋업 후 작성) |

---

## 3. 페이지 구조

```
/journal                  — 일상 노트 + 아이디어 + 큐레이션 피드
/journal/[slug]           — 개별 노트 상세
/build                    — 자체 프로젝트 모음 인덱스
/build/[project-slug]     — 프로젝트별 진행 페이지 (시간순 누적)
```

### 홈 임베드
- 케이스 스터디 다음, Pricing 위에 **"Latest from Journal"** 3개 카드
- 별도 **"What I'm Building"** 섹션 1~2개 (현재 진행 중 프로젝트)

### 메뉴
- 상단: 서비스 / 가격 / **Build** / 문의
- 푸터: Journal, Build, About

이유: Build는 영업 직격이라 상단 노출. Journal은 발견형 콘텐츠라 푸터 + 홈 임베드.

---

## 4. 콘텐츠 템플릿

### Journal 노트 (200~500자)

```yaml
---
title: v0.dev 써본 후기
date: 2026-04-29
tags: [tool, frontend]
status: published     # draft / published
slug: v0-dev-review
cover: attachments/v0-screen.png   # 옵션
---

본문 (마크다운)
```

### Build 로그 (300~800자)

```yaml
---
title: Side Project A — 30% 진행
project: side-project-a
phase: building       # idea / building / shipped
progress: 30
date: 2026-04-29
tags: [build, ai]
status: published
---

## 한 일
- ...

## 배운 점
- ...

## 다음 단계
- ...
```

### 상태 표시
- 💡 아이디어 (`phase: idea`)
- 🛠️ 개발 중 + 진행률 (`phase: building`, `progress: N`)
- ✅ 출시 완료 (`phase: shipped`)

---

## 5. 디자인 방향 (Studio Anthem)

### 카드
- Paper 배경 `#FAF7F0` + 1px Ink hairline
- 제목: **Fraunces serif**, 큼직, 자간 -0.02em
- 날짜·태그: **Geist Mono**, 좌측 상단 작게
- 4px hard shadow (offset, blur 없음)
- 태그는 amber Signal `#FFB800` 작은 ribbon
- 호버: translateY(-2px) + shadow 강조

### 목차/리스트
- 매거진 인덱스 톤
- 발행 날짜 prominent
- Build는 진행률 게이지(가로 바) 추가

### 금지
- indigo, violet, purple, blue, teal
- soft/blur shadow, pills, glassmorphism

상세: [`docs/design-references/redesign-2026-studio-anthem/BRAND.md`](./design-references/redesign-2026-studio-anthem/BRAND.md)

---

## 6. 운영 루틴

### 빈도
- 강제 X
- **"3분 안에 쓸 수 있는 글이 떠오르면 즉시"** 룰
- 모바일에서도 작성 가능 (옵시디언 모바일 앱)

### 마찰 최소화 원칙
옵시디언 vault 작성 → Cmd+S → Git 플러그인 자동 푸시 → Vercel 자동 빌드 → 사이트 반영
**사람 손 1번도 안 들어감.**

### 콘텐츠 분리 원칙
- 같은 vault 안에서도 개인 노트와 발행 노트는 폴더 분리
- `status: draft`인 글은 빌드에서 제외 (실수 방지)

### 아이디어 공개 시 3원칙
1. **"무엇을 만들지" 보다 "왜 흥미로운가"를 쓴다**
2. **진행률·상태를 명확히** (안내판처럼)
3. **실패도 기록한다** (성공담보다 신뢰 쌓임)

---

## 7. 미결정 항목 (셋업·진행 시 결정)

| # | 항목 | 결정 시점 |
|---|------|----------|
| 1 | Obsidian 라이선스 (Personal vs Commercial $50/년) | 셋업 시 |
| 2 | Vault 신규 vs 기존 사용 | 셋업 시 |
| 3 | Vault ↔ 레포 동기화 방식 (심볼릭 링크 vs git submodule) | 셋업 시 |
| 4 | Build 첫 사이드 프로젝트 | 별도 결정 |
| 5 | 시드 콘텐츠 5개 (Journal 3 + Build 2) | 셋업 후 |
| 6 | 이미지 처리 방식 (Vercel Blob vs git public/) | 구현 시 |

---

## 8. 다음 단계 (Task 분해)

1. ✅ 기획 확정 (이 문서)
2. ⬜ **옵시디언 셋업** ([obsidian-publishing-setup.md](./obsidian-publishing-setup.md) 참고)
3. ⬜ **Build 첫 사이드 프로젝트 결정** (방향성 + 첫 빌드 로그 작성)
4. ⬜ **시드 콘텐츠 5개 작성** (Journal 3 + Build 2)
5. ⬜ **Next.js MDX 파이프라인 구현**
   - `src/content/journal`, `src/content/build` 빌드 시 읽기
   - frontmatter 파싱 (gray-matter)
   - `status: published` 필터링
   - 라우트 자동 생성
6. ⬜ **카드·리스트 컴포넌트 구현** (Studio Anthem 톤)
7. ⬜ **홈 임베드 섹션 추가** ("Latest from Journal" + "What I'm Building")
8. ⬜ **메뉴·푸터 노출 추가**
9. ⬜ **이미지 처리 파이프라인** (옵시디언 attachments → 사이트)
10. ⬜ **발행 E2E 테스트** (옵시디언 작성 → 사이트 반영)

---

## 9. 관련 문서

- [obsidian-publishing-setup.md](./obsidian-publishing-setup.md) — 옵시디언 셋업 단계별 가이드
- [design-references/redesign-2026-studio-anthem/BRAND.md](./design-references/redesign-2026-studio-anthem/BRAND.md) — Studio Anthem 디자인 시스템
- [PRD.md](./PRD.md) — Dairect 메인 PRD

---

## 10. 검증 — 왜 옵시디언인가 (의사결정 기록)

| 차원 | 노션 | 옵시디언 | 승자 |
|------|------|---------|------|
| Studio Anthem 디자인 적용 | 라이브러리 한계 | MDX 100% 자유 | 옵시디언 |
| 이미지 안정성 | URL 1시간 만료 이슈 | 로컬 + git 영구 | 옵시디언 |
| 발행 안정성 | API rate limit | 정적 빌드 + CDN | 옵시디언 |
| 데이터 소유권 | 클라우드 종속 | 로컬 마크다운 | 옵시디언 |
| AI 통합 | Notion AI 별도 유료 | MCP 무료 통합 | 옵시디언 |
| 셋업 난이도 | 쉬움 | 보통 | 노션 |
| 협업 | 강력 | 약함 | 노션 |

**결정**: Dairect는 1인 운영 + 매거진 톤 + 디자인 정체성 강함 → 옵시디언이 적합.

비용: 0원~7만원/년 / 토큰: 0원 (발행 자체는 Claude 안 거침).

---

## 11. Epic 2 — Lightweight Admin (v1) — 별도 진행

> ⚠️ **이 Epic은 Phase 1(옵시디언 발행) 안정화 후 별도 진행.**
> 작업 규모: 약 1주 / 우선순위: 시드 콘텐츠 + Build 첫 프로젝트 → 그 다음 어드민

### 11.1 왜 만드나

- 옵시디언 없는 기기(카페 PC, 회사 PC, 친구 기기, 공용 PC 등)에서도 글 작성
- 옵시디언과 **공존 구조** (둘 다 같은 git 파일 시스템을 소스로 사용)

비유: 옵시디언 = 정식 작업실, 어드민 = 외출 노트북. 본업은 옵시디언, 어드민은 보조.

### 11.2 v1 스코프 (필수만)

| 영역 | 포함 (v1) | 보류 (v2 이후) |
|------|----------|---------------|
| 인증 | Jayden만 접근 (미들웨어 보호) | 다중 사용자·권한 |
| 글 작성 폼 | 제목 + 마크다운 textarea + frontmatter 입력 | 풀 마크다운 에디터(tiptap 등) |
| Journal/Build 토글 | 어떤 폴더에 저장할지 선택 | — |
| 저장 메커니즘 | GitHub API → src/content/ 파일 commit | Server-side git (Vercel Functions) |
| 글 목록 | 최근 글 리스트·수정 진입 | 검색·필터·정렬 |
| 미리보기 | 마크다운 1장 렌더링 (저장 전) | 실시간 split-view |
| 이미지 업로드 | ❌ (옵시디언에서 처리하거나 외부 URL) | Vercel Blob 통합 |
| 충돌 처리 | last write wins (단순) | 동시 편집 감지·머지 UI |

### 11.3 옵시디언과의 공존 룰

- **둘 다 같은 `src/content/` 파일 수정** — 같은 글의 두 입구
- 동시 편집 충돌 방지: 어드민 사용 중일 땐 옵시디언에서 그 글 안 만짐 (운영 규칙)
- v1은 충돌 자동 해결 안 함 — git push 시 last write wins
- 충돌 발생 시 git이 알려줌 → 수동 머지 (Claude 또는 Jayden이 처리)

### 11.4 미결정 항목 (Epic 2 시작 시 결정)

| # | 항목 | 옵션 |
|---|------|------|
| 1 | 인증 방식 | Supabase Auth (정식) / Vercel Password Protection (간단) |
| 2 | 저장 메커니즘 | GitHub API + PAT / GitHub App / Server-side git |
| 3 | 마크다운 에디터 | textarea 단순 / @uiw/react-md-editor / tiptap |
| 4 | URL 구조 | `/admin/new`, `/admin/[slug]` |
| 5 | 모바일 반응형 어디까지 | 작성 가능 / 목록 보기만 |

### 11.5 Epic 2 시작 트리거

다음 **모두 완료** 후 Epic 2 시작:
- ✅ Phase 1 옵시디언 발행 안정화 (글 5개 이상 정상 발행)
- ✅ 시드 콘텐츠 작성 완료
- ✅ Build 첫 사이드 프로젝트 빌드 로그 시작
- ⏳ "옵시디언 없는 기기에서 작성"이 실제로 자주 발생하는지 확인 (월 2회 이상)

⚠️ 마지막 트리거 중요: 머릿속 가설로만 어드민 만들지 말고, **실제 필요 빈도 확인 후** 결정.

### 11.6 보안 (🟡 부분 보안 등급)

- 미들웨어 인증 검증 우회 방지 (`/admin/*` 라우트 모두 보호)
- CSRF 토큰
- Rate limit (글 작성 API: 분당 10회 등)
- 인증 정보 `.env.local` 분리, 절대 커밋 X
- GitHub PAT 사용 시 권한 최소화 (`repo` 스코프 only)
- 글 작성 시 입력 검증 (Zod) — XSS·SQL injection 방어
- 보안 리뷰 필수: Epic 2 완료 시 `security-reviewer` 에이전트 호출
