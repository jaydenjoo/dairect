import type { ReactNode } from "react";
import type { PortfolioCategory, PortfolioStatusType } from "@/lib/validation/portfolio";

/**
 * /projects 페이지 내 각 프로젝트 row에 필요한 display 데이터.
 *
 * 디자인 제약: 이 타입은 번들 Landing.html [P-02] 의 JSX 에 직접 매핑됨
 * (ProjectsIndex.tsx 의 <article.p-row> 렌더링). 필드 추가/변경 시 JSX 와
 * projects.css 의 className 구조도 동시 확인 필수.
 */
export type Project = {
  num: string; // "N°01" ~ "N°10" (자동 부여)
  slug: string; // 고유 키 (DB 의 project.id 또는 fallback 의 hardcoded slug)
  cat: PortfolioCategory;
  name: string; // 이름의 앞부분 (amber 前), 예: "Chat"
  nameAmber: string; // 이름의 amber 강조 부분, 예: "sio"
  ko: string; // 한 줄 한글 서브타이틀
  badge: string; // 카테고리 배지, 예: "★ Featured · SaaS"
  desc: ReactNode; // 설명 — <em> 강조 지원을 위해 ReactNode
  year: string; // 오른쪽 meta grid "Year"
  dur: string; //                    "Dur."
  stack: string; //                  "Stack"
  status: string; //                 "Status"
  statusType: PortfolioStatusType; // .v.live (green) / .v.wip (dust) 분기
  meta: string; // cursor-follow thumb hover 시 표시
};
