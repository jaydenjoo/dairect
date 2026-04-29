# 옵시디언 발행 셋업 가이드

> 옵시디언 → Git → Dairect 사이트 자동 발행 셋업 매뉴얼
> 작성일: 2026-04-29
> 대상 PRD: [PRD-journal-build.md](./PRD-journal-build.md)

---

## 개요

옵시디언 vault에서 글 작성 → 저장(Cmd+S) → Git 플러그인이 자동 커밋·푸시 → Vercel이 자동 빌드 → Dairect 사이트 반영.

비유: **메모장에 글 쓰면 자동으로 사이트에 올라감.** 사람 손 1번도 안 들어감.

---

## 사전 준비

| 항목 | 필요한 것 | 비용 |
|------|----------|------|
| Obsidian 본체 | 설치 + 라이선스 결정 | 0~7만원/년 |
| GitHub 계정 | 이미 있음 | 0원 |
| Dairect 레포 접근 권한 | 이미 있음 | 0원 |
| Vercel 자동 배포 | 이미 연결됨 | 0원 |

### Obsidian 라이선스 결정
- **Personal** (무료): 비상업 개인 사용
- **Commercial** ($50/년 = ~7만원): 회사 업무용
- Dairect는 1인 사업이지만 노트 작성 도구 한정 사용 → 회색지대
- **권장: Commercial 구매** (보수적 판단, 분쟁 소지 차단)

---

## Step 1. Vault 구조 결정

### 옵션 A. 기존 vault 사용 (권장)
```
MyVault/
├── 00-개인노트/
├── 80-Dairect/             ← 이 폴더만 별도 git 동기화
│   ├── journal/
│   ├── build/
│   └── attachments/
└── ...
```

### 옵션 B. 신규 vault 생성 (전용)
```
DairectContent/
├── journal/
├── build/
└── attachments/
```

**추천: 옵션 A** — 기존 워크플로우 흐름 유지. `80-Dairect/` 폴더만 Dairect 레포에 매핑.

---

## Step 2. Dairect 레포 콘텐츠 폴더 셋업

```
src/content/
├── journal/
│   └── *.mdx
└── build/
    └── *.mdx
```

이 폴더를 옵시디언 vault의 `80-Dairect/`와 동기화.

### 동기화 방법 3가지

**방법 1. 심볼릭 링크** ⭐ 권장 (가장 간단)
```bash
ln -s ~/project/dairect/src/content ~/Documents/MyVault/80-Dairect
```
- 장: 셋업 즉시 완료, 양쪽 즉시 반영
- 단: macOS·Windows 차이 (Windows는 mklink), 클라우드 동기화(iCloud 등)와 가끔 충돌

**방법 2. Git Submodule**
- `src/content/`를 별도 git submodule로 분리
- 옵시디언이 그 폴더를 vault로 추가
- 장: 깔끔한 분리
- 단: submodule 학습 필요, 커밋 두 번 (submodule + 메인)

**방법 3. Dairect 레포 자체를 vault로**
- Dairect 레포를 옵시디언 vault로 추가
- 장: 단순
- 단: 코드 폴더(node_modules 등)가 노트 검색에 끼어듦. 비추.

**최종 추천: 방법 1 (심볼릭 링크)** — 30초 셋업.

---

## Step 3. Obsidian Git 플러그인 설치·설정

### 설치
1. 옵시디언 → Settings → Community plugins → **Browse**
2. **"Obsidian Git"** 검색 → Install → Enable

### 설정 (Settings → Obsidian Git)
```
Vault backup interval: 5 minutes      # 5분마다 자동 커밋·푸시
Auto pull interval: 10 minutes
Commit message: "journal: {{date}}"   # 자동 커밋 메시지
Pull on startup: true
Push on backup: true
```

### GitHub 인증
첫 실행 시 인증 필요:
- 옵션 A. **Personal Access Token** (간단)
  - GitHub Settings → Developer settings → Personal access tokens → Generate
  - scope: `repo` 체크
  - 옵시디언 Git 플러그인에 토큰 입력
- 옵션 B. **SSH key** (보안 강함)
  - 이미 SSH 셋업되어 있으면 그대로 사용

---

## Step 4. Frontmatter 템플릿 설정

### 템플릿 폴더 생성
옵시디언 → Settings → Templates → Template folder location: `templates/`

### Journal 템플릿 (`templates/journal.md`)
```yaml
---
title: 
date: {{date:YYYY-MM-DD}}
tags: []
status: draft
slug: 
---


```

### Build 템플릿 (`templates/build.md`)
```yaml
---
title: 
project: 
phase: building
progress: 0
date: {{date:YYYY-MM-DD}}
tags: [build]
status: draft
---

## 한 일

## 배운 점

## 다음 단계
```

### 핫키 설정
- Settings → Hotkeys → "Insert template" → Cmd+T 등 단축키 지정
- 새 글 만들 때 Cmd+N → Cmd+T로 템플릿 즉시 삽입

---

## Step 5. 발행 흐름

```
1. 옵시디언에서 Cmd+N → Cmd+T로 템플릿 삽입
2. 글 작성
3. 발행 시점에 status: draft → published 변경
4. Cmd+S 저장
5. (자동) 5분 내 Git 플러그인이 커밋·푸시
6. (자동) Vercel이 빌드 시작
7. (자동) 1~3분 후 사이트 반영
```

수동 즉시 푸시: 옵시디언에서 **Cmd+P → "Obsidian Git: Create backup"** 실행.

---

## Step 6. Next.js 측 처리 (별도 Task)

이 부분은 PRD 다음 단계 #5 "Next.js MDX 파이프라인 구현"에서 진행.

핵심 처리 포인트 (구현 시 참고):
- `src/content/journal/*.mdx`, `src/content/build/*.mdx` 빌드 시 읽기
- `gray-matter`로 frontmatter 파싱
- **`status === 'published'` 필터링** (가장 중요)
- 라우트 자동 생성 (App Router의 `generateStaticParams`)
- MDX 컴포넌트 매핑 (Studio Anthem 톤)
- 이미지 경로 매핑 (`attachments/` → `/public/journal-images/` 또는 Vercel Blob)

---

## ⚠️ 주의사항 5가지

### 1. status 필터 강제 (사고 방지 핵심)
- vault에 `draft` 상태로 임시 저장한 글이 사이트에 반영되면 안 됨
- Next.js 빌드 로직에서 **반드시 `status === 'published'` 필터링**
- 셋업 직후 테스트: draft 글이 빌드되지 않는지 확인

### 2. 위키링크 사용 금지
- 옵시디언 `[[글이름]]` 문법은 MDX에서 동작 안 함
- 처음부터 `[글이름](/journal/slug)` 일반 마크다운 링크 사용
- 옵시디언 Settings → Editor → "Use [[Wikilinks]]" → **OFF**

### 3. 이미지 경로 일관성
- 옵시디언: `attachments/image.png`로 저장
- Next.js: 빌드 시 `/public/journal-images/image.png`로 복사 + 경로 치환 필요
- 또는: 빌드 단계에서 Vercel Blob에 업로드

### 4. 비공개 노트 차단
- 개인 노트가 우연히 푸시되는 사고 방지
- Vault 분리 (Step 1) 철저히
- `.gitignore`에 vault 외부 폴더 패턴 명시

### 5. 라이선스 검토
- Personal로 시작했다가 Commercial 필요성 인지하면 즉시 전환
- 옵시디언 라이선스 페이지 주기적 확인

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| Cmd+S 후 사이트 반영 안 됨 | Git 플러그인 미작동 | 옵시디언 콘솔(Cmd+Opt+I)에서 에러 확인 |
| Vercel 빌드 실패 | frontmatter 파싱 오류 | YAML 들여쓰기·따옴표 점검 |
| 이미지 깨짐 | 경로 매핑 오류 | Next.js 빌드 로그에서 attachments 변환 단계 확인 |
| 위키링크 표시 안 됨 | MDX 미지원 문법 | 일반 마크다운 링크 `[]()`로 수정 |
| draft 글이 발행됨 | status 필터 누락 | Next.js 빌드 코드의 published 필터 확인 |
| 자동 푸시 안 됨 | GitHub 인증 만료 | PAT 재발급 또는 SSH key 재인증 |
| 심볼릭 링크 끊김 | 경로 변경됨 | 링크 재생성 (`ln -sf`) |

---

## 관련 명령어

```bash
# 심볼릭 링크 생성 (Step 2)
ln -s ~/project/dairect/src/content ~/Documents/MyVault/80-Dairect

# 심볼릭 링크 확인
ls -la ~/Documents/MyVault/ | grep 80-Dairect

# vault 폴더에서 수동 푸시 (자동화 실패 시)
cd ~/project/dairect
git add src/content && git commit -m "journal: 글 추가" && git push

# Vercel 빌드 로그 확인
vercel logs

# 로컬에서 발행 시뮬레이션
cd ~/project/dairect
pnpm dev
# → http://localhost:3700/journal 확인
```

---

## 다음 단계

옵시디언 셋업 완료 후:
1. ⬜ **시드 콘텐츠 5개 작성** (Journal 3 + Build 2)
2. ⬜ **Next.js MDX 파이프라인 구현 시작** (별도 Task)
3. ⬜ **카드 컴포넌트 구현** (Studio Anthem 톤)
4. ⬜ **홈 임베드 섹션 추가**

전체 흐름: [PRD-journal-build.md Section 8](./PRD-journal-build.md#8-다음-단계-task-분해) 참고.

---

## 참고 자료

- Obsidian: https://obsidian.md
- Obsidian Git 플러그인: https://github.com/Vinzent03/obsidian-git
- gray-matter (frontmatter 파싱): https://github.com/jonschlinkert/gray-matter
- Next.js MDX: https://nextjs.org/docs/app/building-your-application/configuring/mdx
