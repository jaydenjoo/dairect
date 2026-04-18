import { and, asc, desc, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  clients,
  estimates,
  invoices,
  milestones,
  projects,
  userSettings,
} from "@/lib/db/schema";

// ─── 포털 전용 bundle 조회 ───
//
// `/portal/[token]` Server Component에서 validatePortalToken 통과 후 호출.
// 고객에게 노출되어도 안전한 컬럼만 선별 — 내부 메모(projects.memo), 태그(projects.tags),
// 실패 사유(failReason), PM 개인 이메일 등은 제외. 공개 안전 필드만 반환.

// BiDi override + 제어문자 strip — 고객에게 보여주는 자유 입력 필드(milestones.description 등)
// 방어. Task 2-8-B에서 확립된 safeMultilineText 정책을 실제 렌더링 직전에 서버 사이드로 적용.
const CONTROL_AND_BIDI = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u202A-\u202E\u2066-\u2069]/g;
function stripUnsafeChars(value: string | null): string | null {
  if (value === null) return null;
  return value.replace(CONTROL_AND_BIDI, "");
}

export type PortalProjectBundle = {
  project: {
    id: string;
    name: string;
    status: string;
    contractAmount: number | null;
    startDate: string | null;
    endDate: string | null;
  };
  client: {
    companyName: string | null;
    contactName: string | null;
  };
  manager: {
    // userSettings 기반 PM 표기용 정보 (회사명/대표자/담당 이메일만 노출).
    companyName: string | null;
    representativeName: string | null;
    businessEmail: string | null;
  };
  milestones: Array<{
    id: string;
    title: string;
    description: string | null;
    isCompleted: boolean;
    dueDate: string | null;
    completedAt: string | null;
    sortOrder: number;
  }>;
  estimates: Array<{
    id: string;
    estimateNumber: string;
    title: string;
    status: string;
    totalAmount: number | null;
    validUntil: string | null;
    sentAt: string | null;
    acceptedAt: string | null;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    type: string;
    status: string;
    totalAmount: number;
    issuedDate: string | null;
    dueDate: string | null;
    paidDate: string | null;
  }>;
};

/**
 * @internal — caller MUST pass a UUID that already passed `validatePortalToken`.
 * Direct external invocation with an untrusted string can surface Postgres
 * `invalid input syntax for type uuid` errors in logs. UUID 재검증은 그 상류
 * (token.ts Zod) 에서 끝났다는 전제.
 */
export async function getPortalProjectBundle(
  projectId: string,
): Promise<PortalProjectBundle | null> {
  // 1. 프로젝트 + 고객사 + PM 설정 조인 (1쿼리)
  const [projectRow] = await db
    .select({
      projectId: projects.id,
      projectName: projects.name,
      projectStatus: projects.status,
      contractAmount: projects.contractAmount,
      startDate: projects.startDate,
      endDate: projects.endDate,
      deletedAt: projects.deletedAt,
      clientCompanyName: clients.companyName,
      clientContactName: clients.contactName,
      pmCompanyName: userSettings.companyName,
      pmRepresentativeName: userSettings.representativeName,
      pmBusinessEmail: userSettings.businessEmail,
    })
    .from(projects)
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .leftJoin(userSettings, eq(userSettings.userId, projects.userId))
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!projectRow) return null;

  // 2. 마일스톤 (sortOrder ASC, 생성일 tiebreak)
  const milestoneRows = await db
    .select({
      id: milestones.id,
      title: milestones.title,
      description: milestones.description,
      isCompleted: milestones.isCompleted,
      dueDate: milestones.dueDate,
      completedAt: milestones.completedAt,
      sortOrder: milestones.sortOrder,
    })
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(asc(milestones.sortOrder), asc(milestones.createdAt));

  // 3. 견적서 — draft는 고객에게 노출 금지 (초안 상태는 PM 전용).
  const estimateRows = await db
    .select({
      id: estimates.id,
      estimateNumber: estimates.estimateNumber,
      title: estimates.title,
      status: estimates.status,
      totalAmount: estimates.totalAmount,
      validUntil: estimates.validUntil,
      sentAt: estimates.sentAt,
      acceptedAt: estimates.acceptedAt,
    })
    .from(estimates)
    .where(
      and(
        eq(estimates.projectId, projectId),
        ne(estimates.status, "draft"),
      ),
    )
    .orderBy(desc(estimates.createdAt));

  // 4. 청구서 — cancelled는 고객에게 노출 금지 (취소된 청구는 혼란 유발).
  const invoiceRows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      type: invoices.type,
      status: invoices.status,
      totalAmount: invoices.totalAmount,
      issuedDate: invoices.issuedDate,
      dueDate: invoices.dueDate,
      paidDate: invoices.paidDate,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.projectId, projectId),
        ne(invoices.status, "cancelled"),
      ),
    )
    .orderBy(asc(invoices.issuedDate), asc(invoices.createdAt));

  return {
    project: {
      id: projectRow.projectId,
      name: projectRow.projectName,
      status: projectRow.projectStatus ?? "lead",
      contractAmount: projectRow.contractAmount,
      startDate: projectRow.startDate,
      endDate: projectRow.endDate,
    },
    client: {
      companyName: projectRow.clientCompanyName,
      contactName: projectRow.clientContactName,
    },
    manager: {
      companyName: projectRow.pmCompanyName,
      representativeName: projectRow.pmRepresentativeName,
      businessEmail: projectRow.pmBusinessEmail,
    },
    milestones: milestoneRows.map((row) => ({
      id: row.id,
      title: stripUnsafeChars(row.title) ?? "",
      description: stripUnsafeChars(row.description),
      isCompleted: row.isCompleted ?? false,
      dueDate: row.dueDate,
      completedAt: row.completedAt
        ? row.completedAt.toISOString()
        : null,
      sortOrder: row.sortOrder ?? 0,
    })),
    estimates: estimateRows.map((row) => ({
      id: row.id,
      estimateNumber: row.estimateNumber,
      title: stripUnsafeChars(row.title) ?? "",
      // 스키마 default는 "draft". 쿼리에서 draft는 이미 제외되므로 실질적으로 도달 불가
      // 경로지만, 방어값은 스키마 default와 일치시켜 "기본값이 의미와 어긋나는" 위험 제거.
      status: row.status ?? "draft",
      totalAmount: row.totalAmount,
      validUntil: row.validUntil,
      sentAt: row.sentAt ? row.sentAt.toISOString() : null,
      acceptedAt: row.acceptedAt ? row.acceptedAt.toISOString() : null,
    })),
    invoices: invoiceRows.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      type: row.type,
      status: row.status ?? "pending",
      totalAmount: row.totalAmount,
      issuedDate: row.issuedDate,
      dueDate: row.dueDate,
      paidDate: row.paidDate,
    })),
  };
}
