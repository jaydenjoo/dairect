import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  bigint,
  timestamp,
  date,
  jsonb,
  decimal,
  unique,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 사용자 + 설정
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    email: text().unique().notNull(),
    name: text(),
    avatarUrl: text("avatar_url"),
    // Phase 5 Task 5-2-3-A (PRD 섹션 10 결정): 로그인 직후 "마지막 접속 workspace" 우선 해석.
    // NULL 허용 (신규 가입 직후 이력 없음). ON DELETE SET NULL (workspace hard delete 시 자동 해제).
    // `() =>` 화살표 함수로 forward reference — workspaces는 아래에서 정의되지만 Drizzle이 lazy resolve.
    lastWorkspaceId: uuid("last_workspace_id").references(() => workspaces.id, {
      onDelete: "set null",
    }),
    // Phase 5 Task 5-2-1: /onboarding 플로우 진입 여부.
    // NULL = 미완료 (신규 가입) / NOT NULL = 완료 or 건너뛰기. 마이그레이션 0024에서
    // 기존 workspace 소속 사용자는 자동 백필 — Phase 5 이전 가입자 보호.
    onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  },
  (table) => [
    // Task 4-1 M4 보안 리뷰: 데모 샘플 UUID(`sample-data.ts` DEMO_USER_ID)가 실 사용자
    // 공간에 침입 방지. `00000000-0000-0000-0000-000000000000`은 "데모 전용 예약".
    check(
      "users_not_demo_uuid",
      sql`${table.id} <> '00000000-0000-0000-0000-000000000000'::uuid`,
    ),
  ],
);

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id),

  // 회사 정보 (견적서/계약서 자동 반영)
  companyName: text("company_name"),
  representativeName: text("representative_name"),
  businessNumber: text("business_number"),
  businessAddress: text("business_address"),
  businessPhone: text("business_phone"),
  businessEmail: text("business_email"),
  bankInfo: jsonb("bank_info"),

  // 견적서 기본값
  estimateNumberPrefix: text("estimate_number_prefix").default("EST"),
  contractNumberPrefix: text("contract_number_prefix").default("CON"),
  invoiceNumberPrefix: text("invoice_number_prefix").default("INV"),
  dailyRate: bigint("daily_rate", { mode: "number" }).default(700000),
  defaultPaymentSplit: jsonb("default_payment_split").default(sql`'[
    {"label":"착수금","percentage":30},
    {"label":"중도금","percentage":40},
    {"label":"잔금","percentage":30}
  ]'::jsonb`),

  // 기능 프리셋 (자동 산정용)
  featurePresets: jsonb("feature_presets").default(sql`'[]'::jsonb`),

  // AI 호출 한도 (Task 3-1)
  // NOT NULL + default: 기존 row에 NULL이 남아 `aiLastResetAt < CURRENT_DATE`가 NULL(false) 판정되어
  // 한도 영구 잠김되는 상황 방어. 신규 INSERT 시 default(0, now())로 자동 채움.
  aiDailyCallCount: integer("ai_daily_call_count").default(0).notNull(),
  aiLastResetAt: timestamp("ai_last_reset_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),

  // W3 cron weekly_summary 발송 시점 기록. 6일 내 재발송 방지 멱등성 키.
  lastWeeklySummarySentAt: timestamp("last_weekly_summary_sent_at", { withTimezone: true }),

  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 고객 + 리드
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const clients = pgTable("clients", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  // Phase 5.0 Task 5-1-2: workspace_id NULLABLE 추가 (backfill 전단계).
  // ON DELETE RESTRICT: workspace 삭제 시 하위 data 고아화 방지 (soft delete는 workspaces.deleted_at으로).
  // Task 5-1-3 backfill → Task 5-1-4 NOT NULL 전환.
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name"),
  email: text(),
  phone: text(),
  businessNumber: text("business_number"),
  address: text(),
  status: text({ enum: ["prospect", "active", "completed", "returning"] }).default("prospect"),
  memo: text(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
});

export const clientNotes = pgTable("client_notes", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT)
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
  content: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

export const leads = pgTable(
  "leads",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT)
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
    source: text({
      enum: ["wishket", "kmong", "referral", "direct", "landing_form", "other"],
    }),
    name: text().notNull(),
    email: text(),
    phone: text(),
    projectType: text("project_type"),
    budgetRange: text("budget_range"),
    description: text(),
    status: text({
      enum: ["new", "scheduled", "consulted", "estimated", "contracted", "failed"],
    }).default("new"),
    failReason: text("fail_reason"),
    convertedToProjectId: uuid("converted_to_project_id").references(() => projects.id),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  },
  (t) => [
    check(
      "leads_source_check",
      sql`${t.source} IS NULL OR ${t.source} IN ('wishket', 'kmong', 'referral', 'direct', 'landing_form', 'other')`,
    ),
    check(
      "leads_status_check",
      sql`${t.status} IS NULL OR ${t.status} IN ('new', 'scheduled', 'consulted', 'estimated', 'contracted', 'failed')`,
    ),
  ],
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 프로젝트 + 마일스톤
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const projects = pgTable("projects", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT)
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
  clientId: uuid("client_id").references(() => clients.id),
  name: text().notNull(),
  description: text(),
  status: text({
    enum: [
      "lead", "consulting", "estimate", "contract",
      "in_progress", "review", "completed", "warranty", "closed",
      "cancelled", "failed",
    ],
  }).default("lead"),
  expectedAmount: bigint("expected_amount", { mode: "number" }),
  contractAmount: bigint("contract_amount", { mode: "number" }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  warrantyEndDate: date("warranty_end_date"),
  failReason: text("fail_reason"),
  tags: text().array(),
  memo: text(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),

  // 공개 영역 연동
  isPublic: boolean("is_public").default(false),
  publicAlias: text("public_alias"),
  publicDescription: text("public_description"),
  publicTags: text("public_tags").array(),
  publicScreenshotUrl: text("public_screenshot_url"),
  publicLiveUrl: text("public_live_url"),

  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
});

export const milestones = pgTable("milestones", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT). projects.workspace_id 상속이지만 JOIN 회피 위해 직접 보관.
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
  title: text().notNull(),
  description: text(),
  isCompleted: boolean("is_completed").default(false),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 견적서
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const estimates = pgTable(
  "estimates",
  {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT). 채번 UNIQUE 재조정은 Task 5-1-4.
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
  projectId: uuid("project_id").references(() => projects.id),
  clientId: uuid("client_id").references(() => clients.id),
  estimateNumber: text("estimate_number").notNull(),
  version: integer().default(1),
  parentEstimateId: uuid("parent_estimate_id"),
  title: text().notNull(),
  status: text({
    enum: ["draft", "sent", "accepted", "rejected", "expired"],
  }).default("draft"),
  validUntil: date("valid_until"),
  inputMode: text("input_mode", {
    enum: ["manual", "auto", "ai"],
  }).default("manual"),
  paymentSplit: jsonb("payment_split"),
  supplyAmount: bigint("supply_amount", { mode: "number" }),
  taxAmount: bigint("tax_amount", { mode: "number" }),
  totalAmount: bigint("total_amount", { mode: "number" }),
  totalDays: decimal("total_days", { precision: 5, scale: 1 }),
  notes: text(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  },
  (table) => [
    // 채번 경합 방지: (workspaceId, estimateNumber) 조합 유니크 (Task 5-1-4 신규).
    unique("estimates_workspace_number_unique").on(table.workspaceId, table.estimateNumber),
  ],
);

export const estimateItems = pgTable("estimate_items", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  estimateId: uuid("estimate_id")
    .notNull()
    .references(() => estimates.id),
  // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT). 견적 1건당 수십 row라 JOIN 회피 효과 큼.
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
  name: text().notNull(),
  description: text(),
  category: text(),
  manDays: decimal("man_days", { precision: 5, scale: 1 }),
  difficulty: decimal({ precision: 3, scale: 1 }).default("1.0"),
  unitPrice: bigint("unit_price", { mode: "number" }),
  quantity: integer().default(1),
  subtotal: bigint({ mode: "number" }),
  sortOrder: integer("sort_order").default(0),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 계약서
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const contracts = pgTable(
  "contracts",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT). 채번 UNIQUE 재조정은 Task 5-1-4.
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
    projectId: uuid("project_id").references(() => projects.id),
    estimateId: uuid("estimate_id").references(() => estimates.id),
    contractNumber: text("contract_number").notNull(),
    status: text({
      enum: ["draft", "sent", "signed", "archived"],
    }).default("draft"),
    warrantyMonths: integer("warranty_months").default(3),
    ipOwnership: text("ip_ownership", {
      enum: ["client", "developer", "shared"],
    }).default("client"),
    liabilityLimit: bigint("liability_limit", { mode: "number" }),
    specialTerms: text("special_terms"),
    mosignUrl: text("mosign_url"),
    signedAt: timestamp("signed_at", { withTimezone: true }),
    signedFileUrl: text("signed_file_url"),
    pdfUrl: text("pdf_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  },
  (table) => [
    // 채번 경합 방지: (workspaceId, contractNumber) 조합 유니크 (Task 5-1-4 재조정).
    unique("contracts_workspace_number_unique").on(table.workspaceId, table.contractNumber),
  ],
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 인보이스 (청구서 / 수금)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const invoices = pgTable(
  "invoices",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT). W2 cron workspace 필터 핵심 + 채번 UNIQUE 재조정은 Task 5-1-4.
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
    projectId: uuid("project_id").references(() => projects.id),
    estimateId: uuid("estimate_id").references(() => estimates.id),
    invoiceNumber: text("invoice_number").notNull(),
    type: text({ enum: ["advance", "interim", "final"] }).notNull(),
    status: text({
      enum: ["pending", "sent", "paid", "overdue", "cancelled"],
    }).default("pending"),
    amount: bigint({ mode: "number" }).notNull(),
    taxAmount: bigint("tax_amount", { mode: "number" }).notNull(),
    totalAmount: bigint("total_amount", { mode: "number" }).notNull(),
    issuedDate: date("issued_date").default(sql`CURRENT_DATE`),
    dueDate: date("due_date"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    paidDate: date("paid_date"),
    paidAmount: bigint("paid_amount", { mode: "number" }),
    taxInvoiceIssued: boolean("tax_invoice_issued").default(false),
    memo: text(),
    pdfUrl: text("pdf_url"),
    // W2 cron 연체 알림: 마지막 발송 시각. NULL이면 아직 미발송, dueDate 갱신 시 NULL로 재설정.
    lastOverdueNotifiedAt: timestamp("last_overdue_notified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
  },
  (table) => [
    // 채번 경합 방지: (workspaceId, invoiceNumber) 조합 유니크 (Task 5-1-4 재조정).
    unique("invoices_workspace_number_unique").on(table.workspaceId, table.invoiceNumber),
  ],
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 활동 로그
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const activityLogs = pgTable("activity_logs", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT). 감사 로그 workspace 스코프 조회 필수.
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
  projectId: uuid("project_id").references(() => projects.id),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  action: text().notNull(),
  description: text(),
  metadata: jsonb(),
  // Task B (audit-4): metadata PII가 pseudonym으로 익명화된 시점. NULL = 평문 상태.
  // 참조: docs/pii-lifecycle.md §2-2 (즉시 이벤트 기반 scrub)
  piiScrubbedAt: timestamp("pii_scrubbed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 랜딩 문의 폼
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    name: text().notNull(),
    contact: text().notNull(),
    ideaSummary: text("idea_summary"),
    description: text(),
    budgetRange: text("budget_range", {
      enum: ["under_100", "100_to_300", "over_300", "unsure"],
    }),
    schedule: text({
      enum: ["within_1month", "1_to_3months", "flexible"],
    }),
    package: text({
      enum: ["diagnosis", "mvp", "expansion"],
    }),
    status: text({
      enum: ["new", "contacted", "converted", "archived"],
    }).default("new"),
    convertedToLeadId: uuid("converted_to_lead_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  },
  (t) => [
    check(
      "inquiries_package_check",
      sql`${t.package} IS NULL OR ${t.package} IN ('diagnosis', 'mvp', 'expansion')`,
    ),
  ],
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI 주간 브리핑 (Task 3-2)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 대시보드 홈 상단 위젯에 노출될 "이번 주 집중할 것 3가지 + 요약".
// weekStartDate = KST 기준 이번 주 월요일(date, YYYY-MM-DD). (userId, weekStartDate) UNIQUE로 upsert.
// contentJson = { focusItems: [{title, reason, priority}...], summary: string } — Zod 재검증 후 저장.
// NOT NULL + default: NULL < CURRENT_DATE 3-value logic 함정 원천 차단 (0007 교훈 반영).

export const briefings = pgTable(
  "briefings",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    // workspace_id: Task 5-1-4에서 NOT NULL 전환 완료. Task 5-2-2g에서 UNIQUE에 포함 → cross-workspace 덮어쓰기 차단.
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
    // mode:"string": postgres.js가 Date 객체로 변환하지 않도록 명시 — UI/Zod 경로에서 ISO date string 일관 유지
    weekStartDate: date("week_start_date", { mode: "string" }).notNull(),
    contentJson: jsonb("content_json").notNull(),
    // 감사 추적: 실제 AI 호출 결과인지, 빈 데이터 fallback인지 구별
    generationType: text("generation_type", {
      enum: ["ai", "empty_fallback"],
    })
      .default("ai")
      .notNull(),
    aiGeneratedAt: timestamp("ai_generated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    // Task 5-2-2g: workspace_id 추가 — cross-workspace 덮어쓰기 차단 (workspace 스위치 후 Regenerate 시 다른 workspace row 덮어쓰기 방어)
    unique("briefings_user_workspace_week_unique").on(table.userId, table.workspaceId, table.weekStartDate),
    check(
      "briefings_generation_type_check",
      sql`${table.generationType} IN ('ai', 'empty_fallback')`,
    ),
  ],
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI 주간 보고서 (Task 3-3) — 프로젝트별 고객 발송용 초안
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// contentJson = { completedThisWeek: [...], plannedNextWeek: [...], issuesRisks: [...], summary: string }
// (userId, projectId, weekStartDate) UNIQUE — 프로젝트별 주 1건 UPSERT.
// briefings와 동일한 NOT NULL + default + generation_type 감사 + RLS 방어선 패턴.

export const weeklyReports = pgTable(
  "weekly_reports",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    // workspace_id: Task 5-1-4에서 NOT NULL 전환 완료. Task 5-2-2g에서 UNIQUE에 포함 → cross-workspace 덮어쓰기 차단.
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    weekStartDate: date("week_start_date", { mode: "string" }).notNull(),
    contentJson: jsonb("content_json").notNull(),
    generationType: text("generation_type", {
      enum: ["ai", "empty_fallback"],
    })
      .default("ai")
      .notNull(),
    aiGeneratedAt: timestamp("ai_generated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    // Task 5-2-2g: workspace_id 추가 — cross-workspace 덮어쓰기 차단 (briefings와 동일 동기)
    unique("weekly_reports_user_workspace_project_week_unique").on(
      table.userId,
      table.workspaceId,
      table.projectId,
      table.weekStartDate,
    ),
    check(
      "weekly_reports_generation_type_check",
      sql`${table.generationType} IN ('ai', 'empty_fallback')`,
    ),
  ],
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 고객 포털 (Task 4-2) — 토큰 발급 + 피드백 수집
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 비로그인 고객이 `/portal/[token]`으로 본인 프로젝트 진행 상황(진행률·마일스톤·인보이스)을
// 열람하고 피드백 제출. 토큰은 crypto.randomUUID()로 발급, 만료 1년, 재발급 시 기존 revoke.
// RLS 방어선은 마이그레이션에서 ENABLE + anon DENY (briefings와 동일 패턴).

export const portalTokens = pgTable(
  "portal_tokens",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    // workspace_id NULLABLE (Task 5-1-2 backfill 전단계, RESTRICT). projects.workspace_id 상속이지만 포털 토큰 조회 시 workspace 컨텍스트 직접 필터.
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "restrict" }),
    token: text().notNull().unique(),
    issuedBy: uuid("issued_by")
      .notNull()
      .references(() => users.id),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    // 만료: 발급 시점 + 1년. 앱 레이어에서 계산해 명시 저장 (DB default 회피 → 갱신 정책 변경 유연성).
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    // 고객 첫 방문 추적 (감사 로그). fire-and-forget UPDATE로 갱신.
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
    // 재발급/수동 취소 시 기록. NULL = 활성 토큰, NOT NULL = 무효. DELETE 대신 soft revoke로 감사 경로 보존.
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    // "프로젝트당 활성 토큰 1건" DB 레벨 불변식.
    // 앱 레이어 트랜잭션 락이 이미 있지만, 향후 cron/외부 경로 추가 시 race를 DB가 거부.
    uniqueIndex("portal_tokens_one_active_per_project_idx")
      .on(table.projectId)
      .where(sql`${table.revokedAt} IS NULL`),
  ],
);

export const portalFeedbacks = pgTable("portal_feedbacks", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  // 어느 토큰으로 제출됐는지 감사 (토큰 재발급 이력 추적). 토큰 삭제(하드)는 없으므로 SET NULL 불필요.
  tokenId: uuid("token_id")
    .notNull()
    .references(() => portalTokens.id, { onDelete: "cascade" }),
  // 피드백 본문: `guardMultiLine` + honeypot 방어 후 저장.
  message: text().notNull(),
  // 감사용 — sanitizeHeader로 제어문자/길이 제한 후 저장.
  clientIp: text("client_ip"),
  userAgent: text("user_agent"),
  // PM 읽음 상태 — M6에서 추가. 기본 false, 읽음 처리 시 readAt도 함께 기록.
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase 5.0 Multi-tenant 기반 (Task 5-1-1)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// PRD-phase5.md Epic 5-1 + PRD-phase5-erd.md 섹션 3 명세 구현.
// 4 테이블 신규: workspaces / workspace_members / workspace_invitations / workspace_settings.
// DB 실제 반영은 Jayden 수동 검토 후 별도 단계 (`pnpm db:push` 또는 Supabase MCP apply_migration).

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    name: text().notNull(),
    // URL-safe 식별자 (예: /invite/[token] 라우팅 맥락). 회원가입 자동 생성 로직은 Task 5-1-3/5-2-7에서.
    slug: text().notNull().unique(),
    // Phase 5.5 Stripe 도입 전까지는 'free' 유지. CHECK로 enum 고정.
    subscriptionStatus: text("subscription_status").default("free").notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    // Task 5-2-2c: 로고 업로드 — Supabase Storage 버킷 'workspace-logos' 참조.
    //   logoUrl: 공개 URL (PDF/UI에 직접 삽입). 제거 시 NULL.
    //   logoStoragePath: Storage 내부 경로 ({workspaceId}/{timestamp}.{ext}). 제거 시 실제 파일 삭제 + NULL.
    logoUrl: text("logo_url"),
    logoStoragePath: text("logo_storage_path"),
    // Workspace soft delete — R7 완화 (30일 유예 복구 가능).
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    check(
      "workspaces_subscription_status_check",
      sql`${table.subscriptionStatus} IN ('free', 'active', 'past_due', 'canceled', 'paused')`,
    ),
  ],
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // owner: 결제+멤버관리+전체 write / admin: 멤버관리+전체 write / member: 자기 프로젝트+하위 write (C2 결정, 2026-04-20)
    role: text().notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    // 한 user는 한 workspace에 1회만 소속
    unique("workspace_members_ws_user_unique").on(table.workspaceId, table.userId),
    check(
      "workspace_members_role_check",
      sql`${table.role} IN ('owner', 'admin', 'member')`,
    ),
    // "이 user가 속한 모든 workspace" 조회는 로그인 후 매 페이지 navigation 핫패스.
    // 복합 UNIQUE의 2번째 컬럼만 쓰면 B-tree prefix 규칙상 index 활용 불가 → user_id 단독 인덱스 추가.
    index("workspace_members_user_idx").on(table.userId),
  ],
);

export const workspaceInvitations = pgTable(
  "workspace_invitations",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    // 초대 대상 이메일 — 가입 전 사용자일 수도 있으므로 users.id FK는 수락 시점에 연결.
    email: text().notNull(),
    // 수락 시 부여될 역할. 같은 3종 CHECK 공유.
    role: text().notNull(),
    // W5 portal_tokens 패턴 재사용 — crypto.randomUUID() 122-bit 엔트로피.
    token: text().notNull().unique(),
    // SET NULL + nullable: 초대자(PM) user 삭제 시 pending 초대 row는 보존(감사 기록) + 초대자 기록만 소실.
    // CASCADE면 감사 끊김, NO ACTION이면 user 삭제 자체 실패 (운영 장애).
    invitedBy: uuid("invited_by")
      .references(() => users.id, { onDelete: "set null" }),
    // 발급 시점 +7일 (B1 결정, 2026-04-20). 연장 옵션(14일)은 별도 Task.
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    // NULL=대기, NOT NULL=수락 완료. workspace_members row 생성과 같은 트랜잭션.
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    // 수동 취소 / 재초대 시 기록. soft revoke로 감사 경로 보존.
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    check(
      "workspace_invitations_role_check",
      sql`${table.role} IN ('owner', 'admin', 'member')`,
    ),
    // 활성 초대(수락 전 + 취소 전) 중복 방어 — 같은 workspace+email에 여러 건 발급 방지.
    // LOWER(email) expression index — DB 레벨 case-insensitive 강제 (zod 우회 경로 defense-in-depth).
    // 실제 DDL은 0033_pending_idx_lower_email.sql에서 수행.
    uniqueIndex("workspace_invitations_pending_idx")
      .on(table.workspaceId, sql`LOWER(${table.email})`)
      .where(sql`${table.acceptedAt} IS NULL AND ${table.revokedAt} IS NULL`),
  ],
);

// A1 독립 테이블 결정 (2026-04-20). user_settings에서 14 필드 이전.
// PK=FK 패턴: workspace_id가 PK이자 workspaces.id FK — 1:1 관계.
// ⚠️ workspace 생성 시 settings row도 반드시 같은 트랜잭션에서 생성해야 함.
//    Task 5-1-3 default backfill + Task 5-2-7 회원가입 자동 프로비저닝에서
//    `INSERT INTO workspaces RETURNING id` → `INSERT INTO workspace_settings (workspace_id) VALUES (...)` 트랜잭션 강제.
//    누락 시 PDF 생성 경로(companyName 참조)에서 null 크래시 위험.
export const workspaceSettings = pgTable("workspace_settings", {
  workspaceId: uuid("workspace_id")
    .primaryKey()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  // 사업자 정보 (견적서/계약서/청구서 PDF에 자동 삽입) — user_settings 7 필드 이전
  companyName: text("company_name"),
  representativeName: text("representative_name"),
  businessNumber: text("business_number"),
  businessAddress: text("business_address"),
  businessPhone: text("business_phone"),
  businessEmail: text("business_email"),
  // 계좌번호/은행명/예금주 jsonb — 청구서 PDF에 표시 (invoices/actions.ts bankInfoSchema 재사용)
  bankInfo: jsonb("bank_info"),

  // 견적서 기본값 — user_settings 5 필드 이전
  estimateNumberPrefix: text("estimate_number_prefix").default("EST"),
  contractNumberPrefix: text("contract_number_prefix").default("CON"),
  invoiceNumberPrefix: text("invoice_number_prefix").default("INV"),
  dailyRate: bigint("daily_rate", { mode: "number" }).default(700000),
  defaultPaymentSplit: jsonb("default_payment_split").default(sql`'[
    {"label":"착수금","percentage":30},
    {"label":"중도금","percentage":40},
    {"label":"잔금","percentage":30}
  ]'::jsonb`),

  // 기능 프리셋 — user_settings에서 이전
  featurePresets: jsonb("feature_presets").default(sql`'[]'::jsonb`),

  // AI 호출 한도 (Task 5-2-2b: user_settings → workspace_settings 이관, Phase 5.5 billing 대비).
  // Parallel Change: user_settings 동일 필드는 DROP하지 않고 stop writing만. 1~2 릴리스 후 DROP Task로 처리.
  // NOT NULL + default로 NULL 잠김 방지 (user_settings와 동일 방어).
  aiDailyCallCount: integer("ai_daily_call_count").default(0).notNull(),
  aiLastResetAt: timestamp("ai_last_reset_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),

  // 플랜 (Task 5-2-2b 잔여 C-H1 해소, 마이그레이션 0032).
  // 허용 값: 'free' | 'pro' | 'team' — DB CHECK 제약으로 강제, TS 레이어는 PLAN_AI_DAILY_LIMITS 맵에 매핑.
  // Phase 5.5 billing에서 plan 변경 UI/Stripe 연동 예정. 현재는 수동 SQL update만 가능.
  plan: text("plan").notNull().default("free"),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Rate Limit (fixed window counter)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Phase 5.5 Task 5-5-4: createInvitationAction 등 abuse 가능 엔드포인트 보호.
// 마이그레이션: 0034_rate_limit_counters.sql
//
// 모델: key당 1 row, ON CONFLICT DO UPDATE로 자동 직렬화 (race 방어).
// RLS: anon/authenticated 모두 RESTRICTIVE deny — server postgres role만 접근.
//
// key 컨벤션 (lib/rate-limit.ts와 일치):
//   - "invite:user:{userId}:m" / ":h" — createInvitationAction 분/시간 한도
//   - 향후 prefix 확장: "login:ip:{ip}", "signup:email:{email}" 등.
export const rateLimitCounters = pgTable(
  "rate_limit_counters",
  {
    key: text().primaryKey(),
    windowStart: timestamp("window_start", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    count: integer().default(1).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [
    // 향후 cleanup cron("WHERE window_start < NOW() - INTERVAL '1 day'")용.
    index("rate_limit_counters_window_start_idx").on(table.windowStart),
  ],
);
