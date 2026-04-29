# 옵시디언 사용 매뉴얼 — Dairect Journal & Build

> 작성일: **2026-04-29**
> 기준 옵시디언 버전: **1.12.7 데스크톱** (2026-03-23 릴리즈)
> 대상: 비개발자, 옵시디언 첫 사용
> 관련 문서: [PRD-journal-build.md](./PRD-journal-build.md), [obsidian-publishing-setup.md](./obsidian-publishing-setup.md)

---

## 📚 이 문서가 다루는 것

1. 우리 Dairect 셋업 사용 매뉴얼 (지금까지 만들어진 것)
2. 옵시디언 자체의 핵심 사용법 + 2026 최신 기능

비유: **옵시디언이라는 "두 번째 뇌(Second Brain)" 도구**의 사용 설명서.

---

## 0. 빠른 시작 — 5분 안에 첫 글 발행

처음에는 디테일 무시하고 일단 한 번 끝까지 가보세요. 익숙해진 후 아래 세부 섹션 읽기.

```
1. 옵시디언 켜기
2. 좌측 파일 탐색기에서 80-Dairect/journal/ 폴더 클릭
3. 새 파일 만들기 (Cmd+N)
4. 파일 이름: 2026-04-29-test.md (날짜-슬러그.md 형식)
5. Cmd+P → "Templates: Insert template" 입력 → journal.md 선택
6. 빈 칸 채우기:
   - title: 테스트 글
   - tags: [test]
   - status: draft  ← 발행 안 함
   - slug: test
   - 본문에 아무 내용
7. 저장 (Cmd+S)
8. ✅ 끝. Dairect 레포에도 같은 파일 자동 저장됨.
```

발행은 status를 `published`로 바꾸고 Claude한테 "글 푸시해줘" 한마디.

---

## 1. 우리 Dairect 셋업 구조 이해

### 1.1 무엇이 어디 있나

```
[옵시디언 vault]
/Users/jayden/Documents/Obsidian Vault/
  ├── (개인 노트들...)
  ├── templates/                  ← 템플릿 양식지 보관소
  │   ├── journal.md
  │   └── build.md
  └── 80-Dairect/                 ← Dairect 글 작업 공간 (심볼릭 링크)
      │   ↓ ↓ ↓ 같은 폴더 ↓ ↓ ↓
[Dairect 레포]
/Users/jayden/project/dairect/src/content/
      ├── journal/                ← Journal 글 저장
      ├── build/                  ← Build 글 저장
      └── attachments/            ← 이미지 등 첨부파일
```

### 1.2 양방향 동기화 원리 — "방 하나에 문 두 개"

비유: **80-Dairect와 src/content는 같은 방의 두 입구**. 어느 쪽에서 글을 써도:
- 같은 파일에 저장됨
- 즉시 다른 쪽에서 보임
- 네트워크 동기화 아님 (OS 레벨, 즉시)

### 1.3 발행 흐름

```
글 작성 (옵시디언)
   ↓ Cmd+S
src/content/에 자동 저장 (양방향 동기화)
   ↓ Claude한테 "글 푸시해줘"
git add → commit → push
   ↓ 자동
Vercel 빌드 (1~3분)
   ↓
Dairect 사이트에 발행됨
```

---

## 2. 옵시디언 핵심 개념

### 2.1 Vault (볼트)

**Vault = 노트들 모아둔 큰 폴더.** 옵시디언이 보는 작업 공간.

비유: **노트북 한 권**. 한 vault 안에 여러 폴더와 파일이 들어감.

우리 vault 위치: `/Users/jayden/Documents/Obsidian Vault`

### 2.2 Note (노트) = 마크다운 파일

옵시디언의 모든 노트는 **`.md` 확장자의 평문 파일**. 즉:
- 옵시디언이 망해도 글이 사라지지 않음
- 다른 어떤 마크다운 도구로도 열 수 있음
- Git으로 버전 관리 가능

### 2.3 Markdown (마크다운)

글을 꾸미는 단순한 문법. 가장 자주 쓰는 것:
| 문법 | 결과 |
|------|------|
| `# 제목` | 큰 제목 |
| `## 부제목` | 작은 제목 |
| `**굵게**` | **굵게** |
| `*기울임*` | *기울임* |
| `- 항목` | 글머리 기호 |
| `1. 항목` | 번호 매기기 |
| `[링크](https://...)` | 하이퍼링크 |
| `![이미지](경로)` | 이미지 삽입 |
| `` `코드` `` | `코드` |

### 2.4 Frontmatter (프론트매터)

노트 맨 위에 메타데이터를 적는 영역. **`---`로 감쌈**.

```yaml
---
title: 글 제목
date: 2026-04-29
tags: [tag1, tag2]
status: draft
---

여기부터 본문
```

**우리는 이 frontmatter로 사이트가 글을 어떻게 다룰지 결정합니다** (제목, 태그, 발행 여부 등).

---

## 3. Templates 플러그인 사용법

### 3.1 활성화 (1회만 하면 됨)

1. **설정** (좌하단 ⚙️) 열기
2. 좌측 메뉴 **"코어 플러그인"** (또는 "핵심 플러그인") 클릭
3. **"템플릿"** (Templates) 토글 **켜기**
4. 좌측 메뉴에 새로 생긴 **"템플릿"** 항목 클릭
5. **"템플릿 폴더 위치"**에 `templates` 입력 (저장 자동)

### 3.2 옵시디언이 지원하는 변수 (전부 3개)

⚠️ 옵시디언 코어 Templates 플러그인은 변수가 **딱 3개만** 있어요. 우리 템플릿에 이미 사용됨.

| 변수 | 의미 | 예시 결과 |
|------|------|----------|
| `{{title}}` | 노트 파일명 | `2026-04-29-test` |
| `{{date}}` | 오늘 날짜 (기본 형식) | `2026-04-29` |
| `{{date:YYYY-MM-DD}}` | 커스텀 날짜 형식 | `2026-04-29` |
| `{{time}}` | 현재 시간 | `15:30` |
| `{{time:HH:mm}}` | 커스텀 시간 형식 | `15:30` |

⚠️ **중요한 문법 규칙**:
- 중괄호 **두 개씩** (`{{`, `}}`) — 한 개나 세 개 아님
- **따옴표 없이** — 그냥 `{{date:YYYY-MM-DD}}`
- 변수 안에 띄어쓰기 없음

❌ **잘못된 예시**:
```yaml
date: "{ date:YYYY-MM-DD }":     # 따옴표·콜론·띄어쓰기 모두 잘못
date: { date }                   # 중괄호 한 개
date: {{ date:YYYY-MM-DD }}      # 변수 안에 띄어쓰기
```

✅ **정확한 예시**:
```yaml
date: {{date:YYYY-MM-DD}}
```

### 3.3 새 글 만들 때 템플릿 삽입

```
1. 80-Dairect/journal/ (또는 build/) 폴더 클릭
2. 새 파일 만들기 (Cmd+N) — 파일명 입력
3. Cmd+P (명령 팔레트 열기)
4. "Templates: Insert template" 검색 → 선택
5. journal.md 또는 build.md 선택
6. 변수가 자동으로 채워짐 ({{date}} → 오늘 날짜)
7. 빈 칸 (title, tags 등) 직접 입력
```

### 3.4 더 강력한 템플릿이 필요하면 (선택, 나중에)

코어 Templates는 변수 3개뿐. 더 강력한 기능(if/else, 사용자 입력 prompt 등)이 필요하면:
- **Templater** 커뮤니티 플러그인 설치
- 단, v1에서는 코어 Templates로 충분

---

## 4. Frontmatter 작성법 — 자주 실수하는 부분 ⚠️

비개발자가 가장 많이 헤매는 영역. 천천히 읽고 따라하면 됩니다.

### 4.1 기본 구조

```yaml
---
키1: 값1
키2: 값2
키3: [값3-1, 값3-2]
---

여기부터 본문
```

규칙:
1. **파일 맨 위**에 위치 (다른 어떤 텍스트도 위에 있으면 안 됨)
2. `---` 두 줄 사이에 작성
3. `키: 값` 형식 (콜론 다음 **반드시 공백** 한 칸)
4. 들여쓰기 정확히 (2 spaces)

### 4.2 우리 Journal 템플릿의 정확한 형식

```yaml
---
title: 글 제목 여기에
date: 2026-04-29
tags: [tool, frontend]
status: draft
slug: my-first-post
---
```

각 필드 설명:
| 필드 | 무엇 | 예시 |
|------|------|------|
| `title` | 글 제목 (사이트에 표시) | `v0.dev 써본 후기` |
| `date` | 작성 날짜 (ISO 형식 권장) | `2026-04-29` |
| `tags` | 태그 목록 (대괄호 안에 쉼표) | `[tool, frontend]` |
| `status` | `draft` (안 보임) / `published` (사이트 발행) | `draft` |
| `slug` | URL 주소 (영문 소문자 + 하이픈) | `v0-dev-review` |

### 4.3 Build 템플릿의 추가 필드

```yaml
---
title: 사이드 프로젝트 A — 30% 진행
project: side-project-a
phase: building
progress: 30
date: 2026-04-29
tags: [build]
status: draft
---
```

| 필드 | 무엇 | 예시 |
|------|------|------|
| `project` | 프로젝트 식별자 (영문) | `side-project-a` |
| `phase` | `idea` / `building` / `shipped` | `building` |
| `progress` | 진행률 0~100 (숫자) | `30` |

### 4.4 ⚠️ 자주 틀리는 패턴 5가지

#### ❌ 실수 1: 콜론 다음 공백 누락
```yaml
title:글제목       # ❌ 콜론 뒤 공백 없음
title: 글제목      # ✅ 공백 한 칸
```

#### ❌ 실수 2: 태그 형식 잘못
```yaml
tags: tool, frontend       # ❌ 대괄호 없음 → 쉼표가 의미 없어짐
tags: [tool, frontend]     # ✅ 대괄호 안에 쉼표 구분
tags:                      # ✅ 또는 리스트 형식
  - tool
  - frontend
```

⚠️ **색상 코드를 태그로 넣으면 안 됨**: `tags: [1a1e24]` ← 이건 디자인 색상 코드. 태그는 의미 있는 키워드만 (`tool`, `idea`, `frontend` 등).

#### ❌ 실수 3: 날짜 형식 따옴표 혼란
```yaml
date: "2026-04-29"      # ✅ 따옴표 있어도 OK
date: 2026-04-29        # ✅ 따옴표 없어도 OK (권장)
date: 2026/04/29        # ❌ 슬래시는 안 됨 → 하이픈 사용
date: 4월 29일           # ❌ ISO 형식 (YYYY-MM-DD) 권장
```

#### ❌ 실수 4: frontmatter 닫기 `---` 빠뜨림
```yaml
---
title: 글
date: 2026-04-29

여기부터 본문 ← ❌ 닫기 --- 없으면 본문 전체가 frontmatter로 인식됨
```

```yaml
---
title: 글
date: 2026-04-29
---            ← ✅ 반드시 닫는 ---

여기부터 본문
```

#### ❌ 실수 5: 본문 위에 다른 줄 추가
```yaml
이건 메모        ← ❌ frontmatter 위에 다른 텍스트
---
title: 글
---
```
frontmatter는 **반드시 파일 최상단**에 위치.

### 4.5 검증 도구

YAML 문법 헷갈리면: https://yamllint.com 에 붙여넣고 검증.

---

## 5. 글 작성 워크플로우

### 5.1 Journal 글 (짧고 자주)

```
[1] 80-Dairect/journal/ 폴더 클릭
[2] Cmd+N → 파일명: 2026-04-29-제목슬러그.md
[3] Cmd+P → "Templates: Insert template" → journal.md
[4] frontmatter 채우기:
    title: (글 제목)
    tags: [관련, 태그]
    status: draft       ← 작성 중일 땐 draft
    slug: 글-슬러그
[5] 본문 작성 (200~500자)
[6] 발행 준비되면:
    status: published 로 변경
[7] Cmd+S 저장
[8] Claude한테 "저널 글 푸시해줘"
```

### 5.2 Build 글 (프로젝트 진행 로그)

```
[1] 80-Dairect/build/ 폴더 클릭
[2] Cmd+N → 파일명: 2026-04-29-프로젝트-30percent.md
[3] Cmd+P → Templates → build.md
[4] frontmatter 채우기:
    title: (프로젝트명 — N% 진행)
    project: 영문-식별자
    phase: building
    progress: 30
    status: draft
[5] 본문 3섹션 작성:
    ## 한 일
    ## 배운 점
    ## 다음 단계
[6] 발행 준비되면 status: published
[7] 저장 + push
```

### 5.3 Draft → Published 의식적 결정

⚠️ **`status: draft`인 글은 사이트에 발행 안 됨.** 작성 중인 미완성 글은 draft 그대로 두면 안전.

`published`로 바꿔서 저장한 글만 git push 시 사이트에 올라감.

---

## 6. 옵시디언 핵심 기능

### 6.1 Properties — Frontmatter UI (편한 방법)

옵시디언은 frontmatter를 **자동으로 폼처럼** 보여줘요. 텍스트로 직접 안 써도 됩니다.

방법:
1. 노트 우상단의 **"속성 추가"** 버튼 클릭
2. 키 입력 (예: `tags`)
3. 옵시디언이 타입 자동 추정 (텍스트, 숫자, 날짜, 리스트, 체크박스)
4. 값 입력

비유: **엑셀 셀에 값 넣듯이** frontmatter 입력. YAML 문법 외울 필요 없음.

### 6.2 태그 (Tags)

태그는 **글 분류용 키워드**. 두 가지 방법:

**방법 1. Frontmatter** (권장):
```yaml
tags: [tool, frontend]
```

**방법 2. 본문 안 인라인**:
```
이 글은 #tool #frontend 카테고리에 속함.
```

좌측 사이드바 → **태그 패널**에서 모든 태그 일람 가능.

### 6.3 백링크 (Backlinks)

다른 노트에서 이 노트를 언급한 경우 자동으로 보여줌.

방법:
- A 노트에서 `[[B 노트 제목]]` 작성 → A에서 B로 링크
- B 노트 우측 패널에 **"이 글을 링크한 노트"** 자동 표시 → A 보임

⚠️ **Dairect 사이트 발행용 글에는 위키링크 `[[]]` 사용 금지** (MDX 변환 안 됨). 일반 마크다운 링크 `[제목](/journal/slug)`만 사용.

### 6.4 검색

`Cmd+Shift+F` — Vault 전체 검색. 빠르고 정규식 지원.

자주 쓰는 검색 패턴:
- `tag:#tool` — 특정 태그
- `path:80-Dairect` — 특정 폴더
- `file:.md` — 마크다운 파일만
- `"정확한 문구"` — 따옴표 안의 정확한 매칭

### 6.5 그래프 뷰

좌측 사이드바 **그래프 아이콘** → 노트 간 연결을 시각적으로 표시.

비유: **지식의 별자리 지도**. 어떤 글이 어떻게 연결됐는지 한눈에.

### 6.6 Daily Notes (선택)

매일 한 노트를 자동 생성. 일기·작업 기록용.
- 코어 플러그인 "데일리 노트" 활성화
- 우리 Dairect 워크플로우와 무관 (개인용)

### 6.7 Canvas (선택)

화이트보드처럼 노트를 시각 배치 + 연결선 그리기.
- 마인드맵, 시스템 다이어그램용
- 우리 Dairect 발행에는 사용 안 함

---

## 7. 옵시디언 2026 최신 기능

### 7.1 Bases — 데이터베이스 기능 ⭐ NEW (2025-2026)

노트들을 **DB 테이블처럼** 보고 정렬·필터.

비유: **노션 DB의 옵시디언 버전**. 하지만 모든 데이터는 그대로 마크다운 파일.

활용 예시:
- Build 프로젝트 목록을 진행률·상태로 정렬
- Journal 글을 태그·날짜로 필터

기능:
- 검색 필터링
- 드래그앤드롭 파일 임포트
- 우클릭 컨텍스트 메뉴

### 7.2 이미지 라이브 편집 ⭐ NEW

노트 안에서 이미지를 **드래그로 크기 조절**, 더블클릭으로 원본 크기 복원.

### 7.3 자동 첨부 정리 ⭐ NEW

노트 삭제 시 **연관된 첨부파일도 같이 삭제할지** 물어봄. 설정값:
- "Always" (항상 같이 삭제)
- "Ask" (매번 물어봄, 권장)
- "Never" (절대 삭제 안 함)

### 7.4 Canvas 백링크 감지 ⭐ NEW

Canvas 파일도 백링크와 그래프 뷰에 포함됨.

### 7.5 모바일 — iOS 공유 시트 ⭐ NEW

다른 앱(브라우저, 메모, 카톡 등)에서 **공유 시트**로 옵시디언에 직접 저장. 옵시디언 앱 안 열어도 됨.

활용: 카페에서 본 좋은 글 링크 → 공유 → 옵시디언에 자동 저장 → 나중에 Journal 글로 발전.

### 7.6 옵시디언 CLI ⭐ NEW

터미널에서 옵시디언 조작. 자동화·스크립팅 가능. (개발자용)

---

## 8. 모바일 사용법

### 설치
- **iOS**: App Store → "Obsidian"
- **Android**: Play Store → "Obsidian"

### Vault 동기화 (모바일에서 같은 vault 보기)

| 방법 | 비용 | 우리 케이스 |
|------|------|-----------|
| **Obsidian Sync** (공식) | $5/월 | ⭐ 가장 안정적 |
| iCloud Drive | 무료 | ⚠️ 우리 vault는 ~/Documents에 있음. iCloud 동기화 OFF 상태로 셋업됨 |
| Dropbox / Google Drive | 무료 | ⚠️ 옵시디언이 공식 지원 안 함, 충돌 위험 |

⚠️ **우리 vault는 심볼릭 링크를 사용**. 심볼릭 링크는 iCloud Drive에서 깨질 수 있어요. 모바일 동기화 원하면 **Obsidian Sync 권장**.

대안: 모바일에서는 80-Dairect 폴더만 별도로 git clone해서 다른 마크다운 에디터 사용 (예: iA Writer).

---

## 9. 자주 쓰는 단축키 (macOS)

| 단축키 | 동작 |
|--------|------|
| `Cmd+N` | 새 노트 |
| `Cmd+S` | 저장 |
| `Cmd+P` | 명령 팔레트 (모든 기능 검색) |
| `Cmd+O` | 노트 빠른 열기 (제목 검색) |
| `Cmd+Shift+F` | Vault 전체 검색 |
| `Cmd+클릭` | 링크 새 탭에서 열기 |
| `Cmd+E` | 편집·읽기 모드 전환 |
| `Cmd+B` | 사이드바 토글 |
| `Cmd+]` / `Cmd+[` | 들여쓰기 늘림·줄임 |
| `Cmd+K` | 링크 만들기 |

⚠️ Templates 삽입 단축키는 기본 없음. 설정 → 단축키에서 직접 지정 (예: `Cmd+T`).

---

## 10. Dairect 글 발행 (Push) 흐름

⚠️ **Obsidian Git 플러그인 안 씀** (vault 구조와 충돌). 대신 **Claude에게 한마디**.

### 발행 절차

```
1. 글 다 썼고 status: published 로 바꿈
2. Cmd+S 저장
3. Claude한테 메시지: "저널 글 푸시해줘"  
   또는: "옵시디언 글 사이트에 발행해줘"
4. Claude가 src/content 변경 확인 → git add/commit/push
5. 1~3분 후 사이트에 반영됨
```

### 직접 push (참고용, 평소 안 써도 됨)

터미널에서:
```bash
cd /Users/jayden/project/dairect
git add src/content
git commit -m "journal: $(date +%Y-%m-%d) 글 추가"
git push
```

---

## 11. 자주 묻는 질문 / 트러블슈팅

### Q1. 옵시디언에서 글 썼는데 Dairect 레포에 안 보여요
- **원인**: 심볼릭 링크 끊김 가능
- **확인**: 터미널에서 `ls -la "/Users/jayden/Documents/Obsidian Vault/" | grep 80-Dairect`
- 결과에 `80-Dairect -> /Users/jayden/project/dairect/src/content` 보이면 정상

### Q2. 사이트에 글이 안 보여요
- **원인 1**: `status: draft` 그대로
  → `published`로 바꾸기
- **원인 2**: git push 안 됨
  → Claude한테 "푸시해줘" 다시
- **원인 3**: Vercel 빌드 실패
  → frontmatter 문법 에러 가능. yamllint.com에서 검증

### Q3. 이미지 첨부 어떻게 해요?
- vault의 `80-Dairect/attachments/` 폴더에 이미지 드래그
- 글에서 `![설명](attachments/image.png)` 참조
- ⚠️ Dairect 사이트에서 정상 표시되려면 별도 빌드 단계 필요 (다음 Task)

### Q4. 옵시디언이 갑자기 80-Dairect 폴더를 못 찾아요
- 심볼릭 링크가 깨졌을 가능성
- 터미널에서 다시 만들기:
```bash
rm "/Users/jayden/Documents/Obsidian Vault/80-Dairect"
ln -s /Users/jayden/project/dairect/src/content "/Users/jayden/Documents/Obsidian Vault/80-Dairect"
```

### Q5. 템플릿 삽입했는데 변수가 안 채워져요
- **원인**: Templates 코어 플러그인 비활성화
- **확인**: 설정 → 코어 플러그인 → "템플릿" 토글 ON 확인

### Q6. 모바일에서도 글 작성하고 싶어요
- 우리 vault는 심볼릭 링크 + Obsidian Sync 미사용 → 모바일 동기화 안 됨
- 옵션 A: Obsidian Sync $5/월 결제 (가장 안정)
- 옵션 B: 추후 만들 어드민 UI 사용 (Epic 2)
- 옵션 C: 모바일에서 GitHub 웹 에디터로 직접 src/content 편집

### Q7. 글을 잘못 push했어요. 되돌릴 수 있나요?
- Claude한테 "방금 push 되돌려줘" 한마디
- Claude가 git revert 진행

### Q8. 옵시디언 vault가 망가지면?
- vault는 단순 폴더. 80-Dairect 안의 글은 Dairect 레포에 git으로 백업됨
- vault만 다시 만들고 심볼릭 링크 다시 걸면 끝

---

## 12. 더 배우고 싶을 때

### 공식 자료
- 옵시디언 공식 도움말: https://help.obsidian.md
- 옵시디언 changelog: https://obsidian.md/changelog
- 옵시디언 포럼: https://forum.obsidian.md

### 추천 커뮤니티 플러그인 (나중에 필요할 때)
- **Templater** — 더 강력한 템플릿 (변수 + 로직)
- **Dataview** — 노트들을 DB처럼 쿼리 (Bases와 유사 기능)
- **Excalidraw** — 손그림 다이어그램
- **Calendar** — 달력 뷰
- **Editor Syntax Highlight** — 코드 블록 색상

⚠️ 플러그인은 **신뢰할 수 있는 것만** 설치 (3rd party 코드 실행).

---

## 📌 우리 셋업 요약 카드 (북마크용)

```
[작성 도구]   옵시디언 (Personal 또는 Commercial)
[작성 위치]   /Users/jayden/Documents/Obsidian Vault/80-Dairect/
[실제 저장]   /Users/jayden/project/dairect/src/content/  (심볼릭 링크 통해)
[템플릿]      vault의 templates/ 폴더 (journal.md, build.md)
[발행]        Claude한테 "글 푸시해줘"
[사이트]      https://dairect.io/journal, /build (구현 후)
```

---

## 출처 (Sources)

이 매뉴얼은 다음 공식 자료를 참고하여 2026-04-29 기준으로 작성됨:

- [Obsidian Changelog (1.12.7)](https://obsidian.md/changelog/) — 2026-03-23 릴리즈 정보
- [Templates - Obsidian Help](https://help.obsidian.md/plugins/templates) — 코어 Templates 플러그인 공식 문서
- [Properties - Obsidian Help](https://help.obsidian.md/properties) — Frontmatter UI 공식 문서
- [YAML front matter - Obsidian Help](https://help.obsidian.md/Advanced+topics/YAML+front+matter)
- [Ultimate Guide to Obsidian Templates - Face Dragons](https://facedragons.com/productivity/obsidian-templates-with-examples/)
- [Getting Started with Obsidian Templates - Obsidian Rocks](https://obsidian.rocks/getting-started-with-templates-in-obsidian/)
- [How to Use YAML Front Matter in Obsidian - WunderTech](https://www.wundertech.net/yaml-front-matter-in-obsidian/)
- [Use YAML Front Matter Correctly in Obsidian - Medium](https://amyjuanli.medium.com/use-yaml-front-matter-correctly-in-obsidian-550e4fa46a4a)

> ⚠️ 옵시디언은 활발히 업데이트되는 도구. 6개월~1년 후 공식 changelog 다시 확인 권장.

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-29 | 최초 작성 (옵시디언 1.12.7 기준) |
