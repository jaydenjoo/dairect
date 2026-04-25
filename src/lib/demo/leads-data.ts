/**
 * Epic Demo-Dairect (2026-04-25): /demo/leads 페이지용 mock leads 24건.
 *
 * 가정: 1인 프리랜서 PM 의 6개월(24주) 동안 매주 1건 씩 인입된 평균 리드 분포.
 * status 분포: contacted 8 / qualified 6 / converted 5 / lost 5 — 현실적 funnel.
 * 채널: kakao / email / phone / referral 4가지 — 작은 비즈니스 일반.
 */

export type DemoLead = {
  id: string;
  company: string;
  contact: string;
  channel: "kakao" | "email" | "phone" | "referral";
  status: "contacted" | "qualified" | "converted" | "lost";
  budget: string; // "₩300만" 형식
  daysAgo: number; // 인입 며칠 전
  note: string;
};

export const DEMO_LEADS: readonly DemoLead[] = [
  { id: "L-024", company: "팩토리 루멘", contact: "최지영", channel: "kakao", status: "contacted", budget: "₩400만", daysAgo: 2, note: "AI 챗봇 + CRM 연동 검토" },
  { id: "L-023", company: "메이커스 클럽", contact: "박재훈", channel: "email", status: "contacted", budget: "₩250만", daysAgo: 4, note: "랜딩 페이지 + 결제 통합" },
  { id: "L-022", company: "센티넬 시큐리티", contact: "김민서", channel: "referral", status: "qualified", budget: "₩800만", daysAgo: 6, note: "사내 대시보드 — 권한 관리 복잡" },
  { id: "L-021", company: "노바 에듀", contact: "이수진", channel: "kakao", status: "qualified", budget: "₩350만", daysAgo: 8, note: "강의 신청 자동화 + 출석 체크" },
  { id: "L-020", company: "스튜디오 라움", contact: "정우성", channel: "email", status: "qualified", budget: "₩500만", daysAgo: 11, note: "고객 포털 + 진행 상황 추적" },
  { id: "L-019", company: "그래비티 스포츠", contact: "한지민", channel: "phone", status: "converted", budget: "₩450만", daysAgo: 14, note: "예약 챗봇 → 계약 체결" },
  { id: "L-018", company: "캠핑 위크엔드", contact: "송기석", channel: "referral", status: "converted", budget: "₩300만", daysAgo: 18, note: "재고 관리 자동화" },
  { id: "L-017", company: "오아시스 카페", contact: "임지원", channel: "kakao", status: "lost", budget: "₩200만", daysAgo: 21, note: "예산 부족 → 6개월 후 재논의" },
  { id: "L-016", company: "하이파이브 키즈", contact: "강도현", channel: "email", status: "qualified", budget: "₩600만", daysAgo: 25, note: "학습 진도 대시보드" },
  { id: "L-015", company: "북스 앤 코", contact: "조서연", channel: "phone", status: "converted", budget: "₩280만", daysAgo: 28, note: "독서 모임 운영 자동화" },
  { id: "L-014", company: "프레시 마켓", contact: "윤상호", channel: "kakao", status: "contacted", budget: "₩550만", daysAgo: 32, note: "구독 박스 정기결제" },
  { id: "L-013", company: "디자인 워크숍", contact: "신예린", channel: "referral", status: "qualified", budget: "₩400만", daysAgo: 38, note: "포트폴리오 사이트 + 문의 폼" },
  { id: "L-012", company: "미네르바 컨설팅", contact: "유승민", channel: "email", status: "lost", budget: "₩900만", daysAgo: 45, note: "내부 개발팀 채용 결정" },
  { id: "L-011", company: "테크니컬 크래프트", contact: "황은비", channel: "phone", status: "contacted", budget: "₩350만", daysAgo: 52, note: "납품 추적 시스템" },
  { id: "L-010", company: "비전 미디어", contact: "오태석", channel: "kakao", status: "converted", budget: "₩650만", daysAgo: 58, note: "콘텐츠 생산 워크플로우" },
  { id: "L-009", company: "리프레시 호텔", contact: "이서영", channel: "referral", status: "qualified", budget: "₩750만", daysAgo: 65, note: "예약·체크인 통합 시스템" },
  { id: "L-008", company: "그린 가든", contact: "박찬호", channel: "email", status: "lost", budget: "₩180만", daysAgo: 72, note: "예산 50% 이하만 — fit 안됨" },
  { id: "L-007", company: "스마트팜 코리아", contact: "정해인", channel: "kakao", status: "contacted", budget: "₩520만", daysAgo: 80, note: "센서 데이터 모니터링" },
  { id: "L-006", company: "포커스 스튜디오", contact: "김다은", channel: "phone", status: "converted", budget: "₩380만", daysAgo: 88, note: "음악 작업 의뢰 관리" },
  { id: "L-005", company: "핸드메이드 라이프", contact: "이재원", channel: "referral", status: "lost", budget: "₩220만", daysAgo: 95, note: "오프라인 위주 — 디지털 우선순위 낮음" },
  { id: "L-004", company: "퀵스타트 헬스", contact: "장유진", channel: "kakao", status: "qualified", budget: "₩460만", daysAgo: 105, note: "PT 예약 + 결제 + 출석" },
  { id: "L-003", company: "앤트워프 갤러리", contact: "최지훈", channel: "email", status: "contacted", budget: "₩300만", daysAgo: 120, note: "전시 캘린더 + 작가 포트폴리오" },
  { id: "L-002", company: "리얼 트래블", contact: "박서연", channel: "referral", status: "lost", budget: "₩700만", daysAgo: 140, note: "팀 빌딩 후 자체 개발 결정" },
  { id: "L-001", company: "우먼스 위", contact: "한가윤", channel: "kakao", status: "contacted", budget: "₩340만", daysAgo: 165, note: "여성 의류 재고 관리" },
];

export const DEMO_LEAD_STATS = {
  total: DEMO_LEADS.length,
  contacted: DEMO_LEADS.filter((l) => l.status === "contacted").length,
  qualified: DEMO_LEADS.filter((l) => l.status === "qualified").length,
  converted: DEMO_LEADS.filter((l) => l.status === "converted").length,
  lost: DEMO_LEADS.filter((l) => l.status === "lost").length,
} as const;
