/**
 * Dairect 데모 모드 샘플 데이터 — Task 4-1 M1
 *
 * `/demo` 라우트에서 비로그인 방문자에게 노출되는 고정 샘플 데이터.
 * 실제 DB 조회 대신 이 모듈이 반환하는 객체를 대시보드 컴포넌트에 주입.
 *
 * 설계 원칙:
 * - 타입은 Drizzle `$inferSelect`로 실제 DB row와 호환 → M4/M5에서 컴포넌트 연결 시 변환 불필요
 * - 날짜는 `new Date()` 기준 상대 계산 (빌드 시점 고정값이 아니라 "항상 최근 데이터"로 보이게)
 * - 고정 UUID로 `/demo` 사이에서 링크 일관 유지 (프로젝트 상세 `/demo/projects/[id]`에서 id 조회)
 * - 실제 DB의 `DEMO_USER_ID`와 충돌하지 않도록 예약 UUID `00000000-...` 사용
 */

import type { InferSelectModel } from "drizzle-orm";
import {
  activityLogs as activityLogsTable,
  clients as clientsTable,
  estimateItems as estimateItemsTable,
  estimates as estimatesTable,
  invoices as invoicesTable,
  milestones as milestonesTable,
  projects as projectsTable,
} from "@/lib/db/schema";

// ─── 타입 ───

export type DemoClient = InferSelectModel<typeof clientsTable>;
export type DemoProject = InferSelectModel<typeof projectsTable>;
export type DemoMilestone = InferSelectModel<typeof milestonesTable>;
export type DemoEstimate = InferSelectModel<typeof estimatesTable>;
export type DemoEstimateItem = InferSelectModel<typeof estimateItemsTable>;
export type DemoInvoice = InferSelectModel<typeof invoicesTable>;
export type DemoActivityLog = InferSelectModel<typeof activityLogsTable>;

// 월별 매출 (KPI 홈 차트용)
export type MonthlyRevenue = {
  month: string; // "YYYY-MM"
  revenue: number;
  count: number;
};

// 통합 반환 타입
export type DemoData = {
  clients: DemoClient[];
  projects: DemoProject[];
  milestones: DemoMilestone[];
  estimates: DemoEstimate[];
  estimateItems: DemoEstimateItem[];
  invoices: DemoInvoice[];
  activityLogs: DemoActivityLog[];
  monthlyRevenue: MonthlyRevenue[];
};

// ─── 고정 UUID (데모 전용 예약 범위) ───

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

export const DEMO_CLIENT_IDS = {
  techstart: "11111111-1111-1111-1111-111111111101",
  boutique: "11111111-1111-1111-1111-111111111102",
  educenter: "11111111-1111-1111-1111-111111111103",
} as const;

export const DEMO_PROJECT_IDS = {
  mvpApp: "22222222-2222-2222-2222-222222222201",
  saasDash: "22222222-2222-2222-2222-222222222202",
  commerce: "22222222-2222-2222-2222-222222222203",
  landing: "22222222-2222-2222-2222-222222222204",
  chatbot: "22222222-2222-2222-2222-222222222205",
} as const;

export const DEMO_ESTIMATE_IDS = {
  mvpApp: "33333333-3333-3333-3333-333333333301",
  saasDash: "33333333-3333-3333-3333-333333333302",
  chatbot: "33333333-3333-3333-3333-333333333303",
} as const;

// ─── 날짜 헬퍼 ───

function dateFromNow(days: number, base: Date): string {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function timestampFromNow(days: number, base: Date): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function monthKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// ─── 통합 팩토리 ───

export function getDemoData(base: Date = new Date()): DemoData {
  return {
    clients: buildClients(base),
    projects: buildProjects(base),
    milestones: buildMilestones(base),
    estimates: buildEstimates(base),
    estimateItems: buildEstimateItems(),
    invoices: buildInvoices(base),
    activityLogs: buildActivityLogs(base),
    monthlyRevenue: buildMonthlyRevenue(base),
  };
}

// ─── 고객 3개 ───

function buildClients(base: Date): DemoClient[] {
  return [
    {
      id: DEMO_CLIENT_IDS.techstart,
      userId: DEMO_USER_ID,
      companyName: "테크스타트 주식회사",
      contactName: "김주현",
      email: "contact@techstart.kr",
      phone: "02-1234-5678",
      businessNumber: "123-45-67890",
      address: "서울특별시 강남구 테헤란로 123",
      status: "active",
      memo: "시리즈 A 직후 MVP 확장 단계. 의사결정 빠르고 결제 조건 A급.",
      createdAt: timestampFromNow(-180, base),
      updatedAt: timestampFromNow(-7, base),
    },
    {
      id: DEMO_CLIENT_IDS.boutique,
      userId: DEMO_USER_ID,
      companyName: "부티크 커머스",
      contactName: "이소영",
      email: "soyoung@boutique-commerce.com",
      phone: "031-777-1234",
      businessNumber: "234-56-78901",
      address: "경기도 성남시 분당구 판교로 456",
      status: "completed",
      memo: "리뉴얼 완료 후 유지보수 계약 논의 중.",
      createdAt: timestampFromNow(-240, base),
      updatedAt: timestampFromNow(-14, base),
    },
    {
      id: DEMO_CLIENT_IDS.educenter,
      userId: DEMO_USER_ID,
      companyName: "에듀센터",
      contactName: "박민호",
      email: "minho@educenter.co.kr",
      phone: "02-9999-8888",
      businessNumber: "345-67-89012",
      address: "서울특별시 마포구 월드컵북로 789",
      status: "active",
      memo: "랜딩 마감 후 AI 챗봇 PoC 논의 진행.",
      createdAt: timestampFromNow(-120, base),
      updatedAt: timestampFromNow(-3, base),
    },
  ];
}

// ─── 프로젝트 5개 (상태별) ───

function buildProjects(base: Date): DemoProject[] {
  return [
    {
      id: DEMO_PROJECT_IDS.mvpApp,
      userId: DEMO_USER_ID,
      clientId: DEMO_CLIENT_IDS.techstart,
      name: "모바일 앱 MVP 개발",
      description: "iOS/Android 네이티브 MVP. 인증·핵심 피처 3개·결제 연동.",
      status: "contract",
      expectedAmount: 42_000_000,
      contractAmount: 42_000_000,
      startDate: dateFromNow(7, base),
      endDate: dateFromNow(75, base),
      warrantyEndDate: null,
      failReason: null,
      tags: ["모바일", "iOS", "Android", "결제"],
      memo: "착수금 입금 확인 후 킥오프 예정.",
      deletedAt: null,
      isPublic: false,
      publicAlias: null,
      publicDescription: null,
      publicTags: null,
      publicScreenshotUrl: null,
      publicLiveUrl: null,
      createdAt: timestampFromNow(-14, base),
      updatedAt: timestampFromNow(-1, base),
    },
    {
      id: DEMO_PROJECT_IDS.saasDash,
      userId: DEMO_USER_ID,
      clientId: DEMO_CLIENT_IDS.techstart,
      name: "SaaS 대시보드 구축",
      description: "관리자 대시보드 + 실시간 차트 + 권한 관리.",
      status: "in_progress",
      expectedAmount: 35_000_000,
      contractAmount: 35_000_000,
      startDate: dateFromNow(-30, base),
      endDate: dateFromNow(30, base),
      warrantyEndDate: null,
      failReason: null,
      tags: ["SaaS", "대시보드", "Next.js"],
      memo: "차트 인테그레이션 마무리 중. 배포 파이프라인 작업 시작.",
      deletedAt: null,
      isPublic: true,
      publicAlias: "TechStart 어드민",
      publicDescription: "실시간 지표와 권한 관리가 결합된 B2B 대시보드.",
      publicTags: ["SaaS", "B2B"],
      publicScreenshotUrl: null,
      publicLiveUrl: null,
      createdAt: timestampFromNow(-45, base),
      updatedAt: timestampFromNow(0, base),
    },
    {
      id: DEMO_PROJECT_IDS.commerce,
      userId: DEMO_USER_ID,
      clientId: DEMO_CLIENT_IDS.boutique,
      name: "이커머스 리뉴얼",
      description: "레거시 쇼핑몰 → Next.js 이전 + 결제·배송 리팩토링.",
      status: "review",
      expectedAmount: 28_000_000,
      contractAmount: 28_000_000,
      startDate: dateFromNow(-60, base),
      endDate: dateFromNow(5, base),
      warrantyEndDate: null,
      failReason: null,
      tags: ["이커머스", "리뉴얼", "Next.js"],
      memo: "검수 중. 클라이언트 피드백 2건 남음.",
      deletedAt: null,
      isPublic: false,
      publicAlias: null,
      publicDescription: null,
      publicTags: null,
      publicScreenshotUrl: null,
      publicLiveUrl: null,
      createdAt: timestampFromNow(-75, base),
      updatedAt: timestampFromNow(-2, base),
    },
    {
      id: DEMO_PROJECT_IDS.landing,
      userId: DEMO_USER_ID,
      clientId: DEMO_CLIENT_IDS.educenter,
      name: "브랜드 랜딩 페이지",
      description: "교육 브랜드 리뉴얼 랜딩. 모션·반응형 포함.",
      status: "completed",
      expectedAmount: 8_000_000,
      contractAmount: 8_000_000,
      startDate: dateFromNow(-90, base),
      endDate: dateFromNow(-14, base),
      warrantyEndDate: dateFromNow(75, base),
      failReason: null,
      tags: ["랜딩", "모션"],
      memo: "배포 완료. 하자보수 기간 중.",
      deletedAt: null,
      isPublic: true,
      publicAlias: "에듀센터 브랜드 랜딩",
      publicDescription: "교육 브랜드의 첫 디지털 임팩트를 설계했습니다.",
      publicTags: ["랜딩", "브랜드"],
      publicScreenshotUrl: null,
      publicLiveUrl: null,
      createdAt: timestampFromNow(-100, base),
      updatedAt: timestampFromNow(-14, base),
    },
    {
      id: DEMO_PROJECT_IDS.chatbot,
      userId: DEMO_USER_ID,
      clientId: DEMO_CLIENT_IDS.educenter,
      name: "AI 챗봇 PoC",
      description: "수강생 FAQ 자동 응대 챗봇 개념검증.",
      status: "lead",
      expectedAmount: 12_000_000,
      contractAmount: null,
      startDate: null,
      endDate: null,
      warrantyEndDate: null,
      failReason: null,
      tags: ["AI", "PoC", "챗봇"],
      memo: "견적 발송 완료, 내부 검토 중.",
      deletedAt: null,
      isPublic: false,
      publicAlias: null,
      publicDescription: null,
      publicTags: null,
      publicScreenshotUrl: null,
      publicLiveUrl: null,
      createdAt: timestampFromNow(-5, base),
      updatedAt: timestampFromNow(-2, base),
    },
  ];
}

// ─── 마일스톤 ───

function buildMilestones(base: Date): DemoMilestone[] {
  // 각 프로젝트별 마일스톤 세트. 순서: 완료 → 진행 → 미완료.
  type Seed = { projectId: string; title: string; completed: boolean; dueOffset: number };
  const seeds: Seed[] = [
    // MVP 앱 (contract 단계, 2/4 완료)
    { projectId: DEMO_PROJECT_IDS.mvpApp, title: "요구사항 정의", completed: true, dueOffset: -20 },
    { projectId: DEMO_PROJECT_IDS.mvpApp, title: "디자인 시안", completed: true, dueOffset: -7 },
    { projectId: DEMO_PROJECT_IDS.mvpApp, title: "iOS 네이티브 구현", completed: false, dueOffset: 30 },
    { projectId: DEMO_PROJECT_IDS.mvpApp, title: "Android 네이티브 구현", completed: false, dueOffset: 55 },
    // SaaS 대시보드 (in_progress, 2/4 완료)
    { projectId: DEMO_PROJECT_IDS.saasDash, title: "인증/권한 시스템", completed: true, dueOffset: -20 },
    { projectId: DEMO_PROJECT_IDS.saasDash, title: "대시보드 뷰 기본", completed: true, dueOffset: -7 },
    { projectId: DEMO_PROJECT_IDS.saasDash, title: "차트 인테그레이션", completed: false, dueOffset: 10 },
    { projectId: DEMO_PROJECT_IDS.saasDash, title: "배포 파이프라인", completed: false, dueOffset: 25 },
    // 이커머스 (review, 3/4 완료)
    { projectId: DEMO_PROJECT_IDS.commerce, title: "데이터 마이그레이션", completed: true, dueOffset: -45 },
    { projectId: DEMO_PROJECT_IDS.commerce, title: "신규 UI 구현", completed: true, dueOffset: -20 },
    { projectId: DEMO_PROJECT_IDS.commerce, title: "결제 연동", completed: true, dueOffset: -7 },
    { projectId: DEMO_PROJECT_IDS.commerce, title: "사용자 테스트", completed: false, dueOffset: 3 },
    // 랜딩 (completed, 4/4 완료)
    { projectId: DEMO_PROJECT_IDS.landing, title: "카피 기획", completed: true, dueOffset: -80 },
    { projectId: DEMO_PROJECT_IDS.landing, title: "디자인", completed: true, dueOffset: -60 },
    { projectId: DEMO_PROJECT_IDS.landing, title: "구현", completed: true, dueOffset: -30 },
    { projectId: DEMO_PROJECT_IDS.landing, title: "발행", completed: true, dueOffset: -14 },
    // 챗봇 PoC (lead, 마일스톤 없음)
  ];
  return seeds.map((s, idx) => ({
    id: `44444444-4444-4444-4444-4444444444${String(idx + 1).padStart(2, "0")}`,
    projectId: s.projectId,
    title: s.title,
    description: null,
    isCompleted: s.completed,
    dueDate: dateFromNow(s.dueOffset, base),
    completedAt: s.completed ? timestampFromNow(s.dueOffset, base) : null,
    sortOrder: idx,
    createdAt: timestampFromNow(s.dueOffset - 14, base),
    updatedAt: timestampFromNow(s.completed ? s.dueOffset : -1, base),
  }));
}

// ─── 견적서 3개 ───

function buildEstimates(base: Date): DemoEstimate[] {
  return [
    {
      id: DEMO_ESTIMATE_IDS.mvpApp,
      userId: DEMO_USER_ID,
      projectId: DEMO_PROJECT_IDS.mvpApp,
      clientId: DEMO_CLIENT_IDS.techstart,
      estimateNumber: "EST-2026-001",
      version: 1,
      parentEstimateId: null,
      title: "모바일 앱 MVP 견적서",
      status: "accepted",
      validUntil: dateFromNow(14, base),
      inputMode: "ai",
      paymentSplit: [
        { label: "착수금", percentage: 30 },
        { label: "중도금", percentage: 40 },
        { label: "잔금", percentage: 30 },
      ],
      supplyAmount: 38_181_818,
      taxAmount: 3_818_182,
      totalAmount: 42_000_000,
      totalDays: "60.0",
      notes: "iOS/Android 동시 개발. 결제 연동 포함.",
      sentAt: timestampFromNow(-20, base),
      acceptedAt: timestampFromNow(-14, base),
      pdfUrl: null,
      createdAt: timestampFromNow(-25, base),
    },
    {
      id: DEMO_ESTIMATE_IDS.saasDash,
      userId: DEMO_USER_ID,
      projectId: DEMO_PROJECT_IDS.saasDash,
      clientId: DEMO_CLIENT_IDS.techstart,
      estimateNumber: "EST-2026-002",
      version: 1,
      parentEstimateId: null,
      title: "SaaS 대시보드 견적서",
      status: "accepted",
      validUntil: dateFromNow(-45, base),
      inputMode: "manual",
      paymentSplit: [
        { label: "착수금", percentage: 30 },
        { label: "중도금", percentage: 40 },
        { label: "잔금", percentage: 30 },
      ],
      supplyAmount: 31_818_182,
      taxAmount: 3_181_818,
      totalAmount: 35_000_000,
      totalDays: "50.0",
      notes: "실시간 차트·권한 관리 포함.",
      sentAt: timestampFromNow(-55, base),
      acceptedAt: timestampFromNow(-48, base),
      pdfUrl: null,
      createdAt: timestampFromNow(-60, base),
    },
    {
      id: DEMO_ESTIMATE_IDS.chatbot,
      userId: DEMO_USER_ID,
      projectId: DEMO_PROJECT_IDS.chatbot,
      clientId: DEMO_CLIENT_IDS.educenter,
      estimateNumber: "EST-2026-003",
      version: 1,
      parentEstimateId: null,
      title: "AI 챗봇 PoC 견적서",
      status: "sent",
      validUntil: dateFromNow(11, base),
      inputMode: "ai",
      paymentSplit: [
        { label: "착수금", percentage: 50 },
        { label: "잔금", percentage: 50 },
      ],
      supplyAmount: 10_909_091,
      taxAmount: 1_090_909,
      totalAmount: 12_000_000,
      totalDays: "18.0",
      notes: "Claude API + RAG 기본 구성. 2주 내 PoC.",
      sentAt: timestampFromNow(-2, base),
      acceptedAt: null,
      pdfUrl: null,
      createdAt: timestampFromNow(-3, base),
    },
  ];
}

// ─── 견적 항목 ───

function buildEstimateItems(): DemoEstimateItem[] {
  // 견적서당 대표 항목 3개씩 (9건). 시연용이라 상세도 축약.
  return [
    // MVP 앱
    { id: "55555555-0000-0000-0000-000000000001", estimateId: DEMO_ESTIMATE_IDS.mvpApp, name: "iOS 네이티브 개발", description: "Swift UI·핵심 피처 3종", category: "구현", manDays: "22.0", difficulty: "1.2", unitPrice: 700_000, quantity: 1, subtotal: 18_480_000, sortOrder: 0 },
    { id: "55555555-0000-0000-0000-000000000002", estimateId: DEMO_ESTIMATE_IDS.mvpApp, name: "Android 네이티브 개발", description: "Kotlin + Jetpack Compose", category: "구현", manDays: "22.0", difficulty: "1.2", unitPrice: 700_000, quantity: 1, subtotal: 18_480_000, sortOrder: 1 },
    { id: "55555555-0000-0000-0000-000000000003", estimateId: DEMO_ESTIMATE_IDS.mvpApp, name: "결제 연동 (PG/인앱)", description: "아임포트 · 스토어 결제", category: "외부연동", manDays: "6.0", difficulty: "1.0", unitPrice: 700_000, quantity: 1, subtotal: 4_200_000, sortOrder: 2 },
    // SaaS
    { id: "55555555-0000-0000-0000-000000000004", estimateId: DEMO_ESTIMATE_IDS.saasDash, name: "인증/권한 시스템", description: "RBAC · 세션 · 감사 로그", category: "구현", manDays: "12.0", difficulty: "1.1", unitPrice: 700_000, quantity: 1, subtotal: 9_240_000, sortOrder: 0 },
    { id: "55555555-0000-0000-0000-000000000005", estimateId: DEMO_ESTIMATE_IDS.saasDash, name: "대시보드 + 차트", description: "실시간 갱신 · Recharts", category: "구현", manDays: "22.0", difficulty: "1.2", unitPrice: 700_000, quantity: 1, subtotal: 18_480_000, sortOrder: 1 },
    { id: "55555555-0000-0000-0000-000000000006", estimateId: DEMO_ESTIMATE_IDS.saasDash, name: "배포 파이프라인", description: "Vercel · Preview Deploy", category: "DevOps", manDays: "8.0", difficulty: "1.0", unitPrice: 700_000, quantity: 1, subtotal: 5_600_000, sortOrder: 2 },
    // 챗봇 PoC
    { id: "55555555-0000-0000-0000-000000000007", estimateId: DEMO_ESTIMATE_IDS.chatbot, name: "Claude API 연동", description: "시스템 프롬프트 · Tool use", category: "AI", manDays: "6.0", difficulty: "1.0", unitPrice: 700_000, quantity: 1, subtotal: 4_200_000, sortOrder: 0 },
    { id: "55555555-0000-0000-0000-000000000008", estimateId: DEMO_ESTIMATE_IDS.chatbot, name: "RAG 기본 구성", description: "pgvector · 임베딩 파이프라인", category: "AI", manDays: "8.0", difficulty: "1.1", unitPrice: 700_000, quantity: 1, subtotal: 6_160_000, sortOrder: 1 },
    { id: "55555555-0000-0000-0000-000000000009", estimateId: DEMO_ESTIMATE_IDS.chatbot, name: "데모 웹 위젯", description: "임베드 가능한 위젯 UI", category: "구현", manDays: "4.0", difficulty: "0.9", unitPrice: 700_000, quantity: 1, subtotal: 2_520_000, sortOrder: 2 },
  ];
}

// ─── 인보이스 12건 (진행 단계별 paid/sent/pending 믹스) ───

function buildInvoices(base: Date): DemoInvoice[] {
  return [
    // MVP 앱 — contract 단계: advance paid, interim/final pending
    inv("66666666-0000-0000-0000-000000000001", DEMO_PROJECT_IDS.mvpApp, DEMO_ESTIMATE_IDS.mvpApp, "INV-2026-001", "advance", "paid", 12_600_000, { issued: -10, due: -3, paid: -5 }, base),
    inv("66666666-0000-0000-0000-000000000002", DEMO_PROJECT_IDS.mvpApp, DEMO_ESTIMATE_IDS.mvpApp, "INV-2026-002", "interim", "pending", 16_800_000, { issued: 30 }, base),
    inv("66666666-0000-0000-0000-000000000003", DEMO_PROJECT_IDS.mvpApp, DEMO_ESTIMATE_IDS.mvpApp, "INV-2026-003", "final", "pending", 12_600_000, { issued: 70 }, base),
    // SaaS — in_progress: advance paid, interim paid, final sent
    inv("66666666-0000-0000-0000-000000000004", DEMO_PROJECT_IDS.saasDash, DEMO_ESTIMATE_IDS.saasDash, "INV-2026-004", "advance", "paid", 10_500_000, { issued: -45, due: -38, paid: -40 }, base),
    inv("66666666-0000-0000-0000-000000000005", DEMO_PROJECT_IDS.saasDash, DEMO_ESTIMATE_IDS.saasDash, "INV-2026-005", "interim", "paid", 14_000_000, { issued: -14, due: -7, paid: -5 }, base),
    inv("66666666-0000-0000-0000-000000000006", DEMO_PROJECT_IDS.saasDash, DEMO_ESTIMATE_IDS.saasDash, "INV-2026-006", "final", "sent", 10_500_000, { issued: -2, due: 25 }, base),
    // 이커머스 — review: advance/interim paid, final pending
    inv("66666666-0000-0000-0000-000000000007", DEMO_PROJECT_IDS.commerce, null, "INV-2026-007", "advance", "paid", 8_400_000, { issued: -70, due: -63, paid: -65 }, base),
    inv("66666666-0000-0000-0000-000000000008", DEMO_PROJECT_IDS.commerce, null, "INV-2026-008", "interim", "paid", 11_200_000, { issued: -30, due: -23, paid: -25 }, base),
    inv("66666666-0000-0000-0000-000000000009", DEMO_PROJECT_IDS.commerce, null, "INV-2026-009", "final", "pending", 8_400_000, { issued: 0, due: 7 }, base),
    // 랜딩 — completed: 전부 paid
    inv("66666666-0000-0000-0000-000000000010", DEMO_PROJECT_IDS.landing, null, "INV-2026-010", "advance", "paid", 2_400_000, { issued: -95, due: -88, paid: -90 }, base),
    inv("66666666-0000-0000-0000-000000000011", DEMO_PROJECT_IDS.landing, null, "INV-2026-011", "interim", "paid", 3_200_000, { issued: -50, due: -43, paid: -45 }, base),
    inv("66666666-0000-0000-0000-000000000012", DEMO_PROJECT_IDS.landing, null, "INV-2026-012", "final", "paid", 2_400_000, { issued: -14, due: -7, paid: -10 }, base),
  ];
}

type InvoiceDates = { issued?: number; due?: number; paid?: number };

function inv(
  id: string,
  projectId: string,
  estimateId: string | null,
  invoiceNumber: string,
  type: "advance" | "interim" | "final",
  status: "pending" | "sent" | "paid" | "overdue" | "cancelled",
  totalAmount: number,
  dates: InvoiceDates,
  base: Date,
): DemoInvoice {
  const supply = Math.round(totalAmount / 1.1);
  const tax = totalAmount - supply;
  return {
    id,
    userId: DEMO_USER_ID,
    projectId,
    estimateId,
    invoiceNumber,
    type,
    status,
    amount: supply,
    taxAmount: tax,
    totalAmount,
    issuedDate: dates.issued !== undefined ? dateFromNow(dates.issued, base) : null,
    dueDate: dates.due !== undefined ? dateFromNow(dates.due, base) : null,
    // sent/paid라도 issued 날짜 없으면 sentAt null 유지 (0 fallback 시 "오늘 발송" 오해 방지)
    sentAt:
      (status === "sent" || status === "paid") && dates.issued !== undefined
        ? timestampFromNow(dates.issued, base)
        : null,
    paidDate: dates.paid !== undefined ? dateFromNow(dates.paid, base) : null,
    paidAmount: status === "paid" ? totalAmount : null,
    taxInvoiceIssued: status === "paid",
    memo: null,
    pdfUrl: null,
    createdAt: timestampFromNow(dates.issued ?? 0, base),
    updatedAt: timestampFromNow(dates.paid ?? dates.issued ?? 0, base),
  };
}

// ─── 활동 로그 10건 (최근 14일) ───

function buildActivityLogs(base: Date): DemoActivityLog[] {
  type Seed = {
    daysAgo: number;
    projectId: string | null;
    entityType: string;
    action: string;
    description: string;
  };
  const seeds: Seed[] = [
    { daysAgo: 0, projectId: DEMO_PROJECT_IDS.saasDash, entityType: "milestone", action: "completed", description: "대시보드 뷰 기본 마일스톤 완료" },
    { daysAgo: 1, projectId: DEMO_PROJECT_IDS.commerce, entityType: "project", action: "status_changed", description: "상태: in_progress → review" },
    { daysAgo: 2, projectId: DEMO_PROJECT_IDS.chatbot, entityType: "estimate", action: "sent", description: "EST-2026-003 발송" },
    { daysAgo: 3, projectId: DEMO_PROJECT_IDS.commerce, entityType: "invoice", action: "created", description: "INV-2026-009 final 청구서 생성" },
    { daysAgo: 5, projectId: DEMO_PROJECT_IDS.mvpApp, entityType: "invoice", action: "paid", description: "INV-2026-001 착수금 12,600,000원 입금 확인" },
    { daysAgo: 5, projectId: DEMO_PROJECT_IDS.saasDash, entityType: "invoice", action: "paid", description: "INV-2026-005 중도금 14,000,000원 입금 확인" },
    { daysAgo: 7, projectId: DEMO_PROJECT_IDS.mvpApp, entityType: "milestone", action: "completed", description: "디자인 시안 마일스톤 완료" },
    { daysAgo: 10, projectId: DEMO_PROJECT_IDS.landing, entityType: "invoice", action: "paid", description: "INV-2026-012 잔금 2,400,000원 입금 확인" },
    { daysAgo: 12, projectId: DEMO_PROJECT_IDS.mvpApp, entityType: "contract", action: "signed", description: "계약서 CON-2026-001 서명 완료" },
    { daysAgo: 14, projectId: DEMO_PROJECT_IDS.landing, entityType: "project", action: "status_changed", description: "상태: review → completed" },
  ];
  return seeds.map((s, idx) => ({
    id: `77777777-0000-0000-0000-0000000000${String(idx + 1).padStart(2, "0")}`,
    userId: DEMO_USER_ID,
    projectId: s.projectId,
    entityType: s.entityType,
    entityId: null,
    action: s.action,
    description: s.description,
    metadata: null,
    createdAt: timestampFromNow(-s.daysAgo, base),
  }));
}

// ─── 월별 매출 6개월 (과거 5개월 + 현재 월) ───

function buildMonthlyRevenue(base: Date): MonthlyRevenue[] {
  // 5개월 전부터 현재 월까지. 상승 추세 (1200만 → 3500만원 정도).
  // 각 월: { month: "YYYY-MM", revenue, count }
  const pattern = [
    { offsetMonths: -5, revenue: 12_400_000, count: 2 },
    { offsetMonths: -4, revenue: 18_600_000, count: 3 },
    { offsetMonths: -3, revenue: 22_100_000, count: 3 },
    { offsetMonths: -2, revenue: 28_700_000, count: 4 },
    { offsetMonths: -1, revenue: 31_400_000, count: 4 },
    { offsetMonths: 0, revenue: 35_200_000, count: 5 },
  ];
  return pattern.map((p) => {
    // day=1 고정. base가 3/31이고 offset=-1이면 JS `setUTCMonth`는 "2월 31일" → 3/3으로 튀어
    // 월이 중복될 수 있음. 명시적으로 1일로 새 Date를 생성해 월말 엣지를 차단.
    const d = new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + p.offsetMonths, 1),
    );
    return {
      month: monthKey(d),
      revenue: p.revenue,
      count: p.count,
    };
  });
}
