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

export const estimates = pgTable("estimates", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
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
});

export const estimateItems = pgTable("estimate_items", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  estimateId: uuid("estimate_id")
    .notNull()
    .references(() => estimates.id),
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
    // 채번 경합 방지: (userId, contractNumber) 조합 유니크
    unique("contracts_user_number_unique").on(table.userId, table.contractNumber),
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
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
  },
  (table) => [
    // 채번 경합 방지: (userId, invoiceNumber) 조합 유니크
    unique("invoices_user_number_unique").on(table.userId, table.invoiceNumber),
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
  projectId: uuid("project_id").references(() => projects.id),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  action: text().notNull(),
  description: text(),
  metadata: jsonb(),
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
    unique("briefings_user_week_unique").on(table.userId, table.weekStartDate),
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
    unique("weekly_reports_user_project_week_unique").on(
      table.userId,
      table.projectId,
      table.weekStartDate,
    ),
    check(
      "weekly_reports_generation_type_check",
      sql`${table.generationType} IN ('ai', 'empty_fallback')`,
    ),
  ],
);
