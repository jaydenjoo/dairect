import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getDemoData, DEMO_CLIENT_IDS } from "@/lib/demo/sample-data";
import { formatKRWLong } from "@/lib/utils/format";
import { projectStatusLabels } from "@/lib/validation/projects";
import { ClientNotesDemo, type DemoNote } from "@/components/demo/client-notes-demo";
import { ArrowLeft, Building2, Mail, Phone, FolderKanban } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sample = getDemoData();
  const client = sample.clients.find((c) => c.id === id);
  return { title: client?.companyName ?? "고객 상세" };
}

const statusLabels: Record<string, string> = {
  prospect: "잠재",
  active: "활성",
  completed: "완료",
  returning: "재계약",
};

// projectStatusLabels는 lib/validation/projects에서 import (M5 code 리뷰 M-2: 중복 제거)

// ─── 고객별 샘플 소통 메모 (fixture) ───
// 원래 `client_notes` 테이블에 저장되지만 M1 샘플 범위에 포함 안 됨 → 여기서 데모 표시용만.
const notesByClient: Record<string, DemoNote[]> = {
  [DEMO_CLIENT_IDS.techstart]: [
    { id: "note-ts-1", content: "시리즈 A 투자 직후, MVP 범위 확장 논의 — 결제 연동 필수로 확정", createdAt: "2026-04-10" },
    { id: "note-ts-2", content: "SaaS 대시보드 중간 점검 미팅. 차트 반응 속도 개선 요청", createdAt: "2026-04-02" },
    { id: "note-ts-3", content: "분기 예산 내부 검토 중 — 답변 다음 주", createdAt: "2026-03-25" },
  ],
  [DEMO_CLIENT_IDS.boutique]: [
    { id: "note-bt-1", content: "리뉴얼 검수 피드백 2건 전달받음. 결제 성공 페이지 카피 수정 필요", createdAt: "2026-04-16" },
    { id: "note-bt-2", content: "유지보수 계약 관심 있음. 다음 주 견적 요청 예정", createdAt: "2026-04-08" },
  ],
  [DEMO_CLIENT_IDS.educenter]: [
    { id: "note-ec-1", content: "챗봇 PoC 견적 전달. 내부 검토 2주 예상", createdAt: "2026-04-16" },
    { id: "note-ec-2", content: "랜딩 배포 후 방문자 수 안정. 하자보수 특이사항 없음", createdAt: "2026-04-05" },
  ],
};

/**
 * /demo/clients/[id] — 고객 상세 (Task 4-1 M5, 옵션 A)
 *
 * 실제 `/dashboard/clients/[id]`와 동일 구조:
 * - 고객 정보 카드 (연락처·메모)
 * - 프로젝트 히스토리 (클릭 시 `/demo/projects/[id]`로 이동)
 * - 소통 메모 (샘플 2~3건 + DemoSafeForm 입력 가드)
 */
export default async function DemoClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sample = getDemoData();

  const client = sample.clients.find((c) => c.id === id);
  if (!client) notFound();

  const clientProjects = sample.projects
    .filter((p) => p.clientId === client.id && !p.deletedAt)
    .sort((a, b) => {
      const aTime = a.createdAt?.getTime() ?? 0;
      const bTime = b.createdAt?.getTime() ?? 0;
      return bTime - aTime;
    });

  const notes = notesByClient[client.id] ?? [];

  return (
    <div className="py-10">
      {/* 뒤로가기 */}
      <Link
        href="/demo/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        고객 목록
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {client.companyName}
        </h1>
        <Badge variant="secondary">
          {statusLabels[client.status ?? "prospect"]}
        </Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* 고객 정보 카드 */}
        <div className="rounded-xl bg-card p-6 shadow-ambient lg:col-span-1">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            고객 정보
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            {client.contactName && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <dd className="text-foreground">{client.contactName}</dd>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <dd className="text-foreground">{client.email}</dd>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <dd className="text-foreground">{client.phone}</dd>
              </div>
            )}
            {client.memo && (
              <div className="mt-4 rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">메모</p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {client.memo}
                </p>
              </div>
            )}
          </dl>
        </div>

        {/* 프로젝트 히스토리 + 메모 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 프로젝트 히스토리 */}
          <div className="rounded-xl bg-card p-6 shadow-ambient">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              프로젝트 히스토리
            </h2>
            {clientProjects.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
                <FolderKanban className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  연결된 프로젝트가 없습니다
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {clientProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/demo/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-foreground">{project.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {project.startDate ?? "—"} ~ {project.endDate ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {formatKRWLong(project.contractAmount)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {projectStatusLabels[
                          (project.status ?? "lead") as keyof typeof projectStatusLabels
                        ] ?? project.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 소통 메모 */}
          <div className="rounded-xl bg-card p-6 shadow-ambient">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              소통 메모
            </h2>
            <div className="mt-4">
              <ClientNotesDemo notes={notes} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
