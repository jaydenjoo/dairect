---
title: dairect Journal & Build 시스템 v1
project: dairect-content-system
phase: building
progress: 40
date: 2026-04-29
tags: [build, content, mdx]
status: published
slug: dairect-content-v1-2026-04-29
---

## 한 일

- 옵시디언 vault 셋업 + 심볼릭 링크 (`80-Dairect/` ↔ `src/content/`)
- Next.js 16 App Router에 MDX 파이프라인 구축 (Task 1)
- Studio Anthem 톤 카드/상세 페이지 적용 (Task 2)
- Build 페이지 디자인 격상 (Task 3) — PhaseTag + ProgressGauge 컴포넌트

## 배운 점

- gray-matter는 YAML 1.1 timestamp를 자동으로 `Date` 객체로 파싱한다. 따옴표 없이 `date: 2026-04-29` 쓰면 string이 아닌 Date.
- 해결: **Zod `preprocess`**로 Date 객체를 ISO string으로 변환 후 검증 → 옵시디언 사용자가 어떤 스타일로 써도 통과.

> "마찰 0의 시스템"을 만들려면 사용자가 실수할 가능성을 코드에서 흡수해야 한다.

## 다음 단계

- Task 4: 홈 임베드 섹션 (`Latest from Journal` + `What I'm Building`)
- Task 5: 메뉴(Build) + 푸터(Journal) 노출
- Task 6: 이미지 처리 파이프라인 (`attachments/` → `public/journal-images/`)
