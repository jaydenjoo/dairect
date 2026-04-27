/**
 * /dashboard/guide — PM 본인용 대시보드 사용 설명서.
 *
 * Server component. Studio Anthem 디자인 — Fraunces serif heading · 1px hairlines.
 * 워크플로우 4단계(리드→프로젝트→견적→계약/정산) + 팁 + 트러블슈팅.
 */
import Link from "next/link";
import {
  UserPlus,
  FolderKanban,
  FileText,
  FileSignature,
  Receipt,
  Users,
  LayoutGrid,
  Settings,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// 1. 시작하기 (체크리스트)
// ─────────────────────────────────────────────────────────
const onboardingChecklist: readonly string[] = [
  "설정에서 회사 정보 입력 (사업자등록증 / 인감 / 계좌)",
  "이메일 / Slack 알림 채널 연결 (선택)",
  "포트폴리오 1건 등록 (공개 /projects 페이지에 노출)",
  "첫 리드 또는 고객 등록 — 견적 발행 흐름 시작",
];

function GettingStarted() {
  return (
    <section className="border border-foreground/10 bg-paper p-8 md:p-12">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
        — Step 0
      </p>
      <h2 className="font-heading text-2xl font-light leading-[1.2] tracking-[-0.02em] text-foreground md:text-3xl">
        시작하기 — 첫 로그인 후 4가지
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-[1.65] text-foreground/70">
        대시보드를 처음 여셨다면, 아래 4가지를 먼저 처리하세요. 견적·계약·인보이스
        PDF에 회사 정보가 자동으로 들어가도록 하기 위한 사전 준비입니다.
      </p>
      <ul className="mt-8 space-y-3">
        {onboardingChecklist.map((item, idx) => (
          <li
            key={item}
            className="flex gap-4 border-t border-foreground/10 py-3 text-sm leading-[1.6] text-foreground/80 first:border-t-0"
          >
            <span className="font-mono text-xs text-foreground/40">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/dashboard/settings"
        className="mt-8 inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-canvas transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_var(--color-foreground)]"
      >
        설정 페이지 열기
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 2. 워크플로우 4단계
// ─────────────────────────────────────────────────────────
type WorkflowStep = {
  num: string;
  title: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
  tasks: readonly string[];
  tip?: string;
};

const workflowSteps: readonly WorkflowStep[] = [
  {
    num: "01",
    title: "리드 / 고객 등록",
    href: "/dashboard/leads",
    Icon: UserPlus,
    description:
      "들어온 문의를 리드로 등록 → 자격 확인 후 고객(Client)으로 승격. 리드는 깔때기 위, 고객은 깔때기 아래입니다.",
    tasks: [
      "리드 추가 — 이름·연락처·관심 패키지·예산 메모",
      "상태 전이: new → contacted → qualified → converted",
      "qualified 단계에서 '고객으로 승격' 버튼 → 자동 연결",
      "고객 상세에서 모든 프로젝트·견적·계약·인보이스 한눈에 확인",
    ],
    tip: "리드 단계에서 1회 무료 상담을 잡고, qualified 후 견적 발행으로 넘어갑니다.",
  },
  {
    num: "02",
    title: "프로젝트 + 마일스톤",
    href: "/dashboard/projects",
    Icon: FolderKanban,
    description:
      "고객 1명 = 프로젝트 N개. 프로젝트 안에 마일스톤(인도 단위)을 쪼개고, 각 마일스톤에 견적·인보이스를 매핑합니다.",
    tasks: [
      "프로젝트 생성 — 고객 선택 + 패키지 + 시작일 + 종료 예정일",
      "마일스톤 추가 — 인도물 단위로 쪼개기 (예: 디자인 / 개발 / 배포)",
      "공개 프로필 폼 — /projects 마케팅 페이지 노출 여부 토글",
      "주간 보고서 카드 — 매주 자동 생성된 AI 보고서 검토 후 고객 발송",
    ],
    tip: "마일스톤 단위로 결제 분할(30/40/30)을 잡으면 현금흐름이 안정됩니다.",
  },
  {
    num: "03",
    title: "견적서 발행",
    href: "/dashboard/estimates",
    Icon: FileText,
    description:
      "프로젝트 확정 후 견적서 PDF를 발행. 채번은 EST-YYYY-NNN 자동. PDF 다운로드 + 고객 링크 공유 가능.",
    tasks: [
      "신규 견적서 — 고객·프로젝트 선택 + 항목별 단가 입력",
      "AI 견적 도우미 — 패키지 기반 항목 자동 제안 (선택)",
      "PDF 미리보기 → 다운로드 → 이메일 첨부",
      "상태 전이: draft → sent → accepted → rejected",
    ],
    tip: "Discovery 견적은 무료 상담 결과 요약을 함께 첨부하면 수락률이 올라갑니다.",
  },
  {
    num: "04",
    title: "계약 + 정산",
    href: "/dashboard/contracts",
    Icon: FileSignature,
    description:
      "수락된 견적 → 계약서(CON-YYYY-NNN) 발행 → 인보이스(INV-YYYY-NNN)로 분할 결제. 입금 확인 후 세금계산서 발행.",
    tasks: [
      "계약서 — 견적 항목 자동 복제 + 환불 조항 포함",
      "인보이스 3분할 — 착수금 / 중도금 / 잔금 (또는 50/50)",
      "입금 확인 시 상태 전이: issued → paid",
      "세금계산서 발행 도우미 — 사업자번호·공급가액 자동 채움",
    ],
    tip: "잔금 입금 전에는 GitHub 저장소 권한 이관을 보류하세요(미수 방어).",
  },
] as const;

function Workflow() {
  return (
    <section>
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
        — Workflow
      </p>
      <h2 className="font-heading text-3xl font-light leading-[1.15] tracking-[-0.02em] text-foreground md:text-4xl">
        의뢰 → 정산까지,
        <br />
        <em className="italic text-foreground/70">대시보드 4단계.</em>
      </h2>

      <ol className="mt-12 space-y-px border border-foreground/10 bg-foreground/10">
        {workflowSteps.map((step) => (
          <li key={step.num} className="bg-paper p-8 md:p-10">
            <div className="grid gap-6 md:grid-cols-[200px_1fr] md:gap-10">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center border border-foreground/20 bg-canvas">
                    <step.Icon className="h-4 w-4 text-foreground" />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50">
                    Step {step.num}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-2xl font-light leading-[1.2] text-foreground md:text-3xl">
                  {step.title}
                </h3>
                <Link
                  href={step.href}
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground/60 transition-colors hover:text-foreground"
                >
                  열기
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div>
                <p className="text-base leading-[1.7] text-foreground/80">
                  {step.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {step.tasks.map((task) => (
                    <li
                      key={task}
                      className="flex gap-3 text-sm leading-[1.6] text-foreground/70"
                    >
                      <span
                        className="mt-2 h-px w-3 shrink-0 bg-foreground/40"
                        aria-hidden
                      />
                      {task}
                    </li>
                  ))}
                </ul>
                {step.tip && (
                  <div className="mt-6 flex gap-3 border-l-2 border-primary bg-canvas p-4">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-[1.6] text-foreground/80">
                      <strong className="font-semibold">Tip.</strong> {step.tip}
                    </p>
                  </div>
                )}
                {/* 스크린샷 자리 */}
                <div className="mt-6 flex aspect-[16/9] items-center justify-center border border-dashed border-foreground/20 bg-canvas">
                  <p className="font-mono text-xs uppercase tracking-wider text-foreground/40">
                    Step {step.num} screenshot · TBD
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 3. 자주 쓰는 팁
// ─────────────────────────────────────────────────────────
type Tip = {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

const tips: readonly Tip[] = [
  {
    Icon: Receipt,
    title: "채번 규칙",
    body:
      "EST-2026-001 (견적) / CON-2026-001 (계약) / INV-2026-001 (인보이스). 연도는 자동, 일련번호는 발행 시점에 +1.",
  },
  {
    Icon: Users,
    title: "리드 vs 고객",
    body:
      "리드 = 검증 전 잠재 고객(폼 응답·상담 신청 단계). 고객 = qualified 이후 실제 거래 대상. 채번/PDF 발행은 고객 단계부터.",
  },
  {
    Icon: LayoutGrid,
    title: "포트폴리오 vs 프로젝트",
    body:
      "포트폴리오 = 공개 /projects 페이지 노출용 마케팅 자산. 프로젝트 = 고객 CRM 단위. 동일한 작업이라도 두 곳에서 별도로 관리.",
  },
  {
    Icon: Settings,
    title: "고객 포털 링크",
    body:
      "프로젝트 상세에서 '고객 포털 링크 생성' → 토큰 기반 URL을 고객에게 전달. 로그인 없이 진행 상황·피드백 작성 가능.",
  },
] as const;

function Tips() {
  return (
    <section className="bg-paper p-8 md:p-12">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
        — Tips
      </p>
      <h2 className="font-heading text-2xl font-light leading-[1.2] tracking-[-0.02em] text-foreground md:text-3xl">
        자주 쓰는 팁
      </h2>
      <div className="mt-8 grid gap-px border border-foreground/10 bg-foreground/10 md:grid-cols-2">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className="flex flex-col gap-3 bg-paper p-6 transition-colors hover:bg-canvas"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-foreground/20 bg-canvas">
                <tip.Icon className="h-3.5 w-3.5 text-foreground" />
              </span>
              <h3 className="font-heading text-lg font-light text-foreground">
                {tip.title}
              </h3>
            </div>
            <p className="text-sm leading-[1.6] text-foreground/70">
              {tip.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// 4. 트러블슈팅
// ─────────────────────────────────────────────────────────
type Trouble = { problem: string; solution: string };

const troubles: readonly Trouble[] = [
  {
    problem: "PDF 다운로드가 동작하지 않습니다.",
    solution:
      "브라우저 팝업 차단을 확인하세요. Safari는 첫 클릭 시 권한 요청이 뜹니다. 그래도 안 되면 페이지 새로고침 후 재시도.",
  },
  {
    problem: "견적서 PDF에 회사 정보가 비어 있습니다.",
    solution:
      "/dashboard/settings 에서 회사명·사업자번호·인감 이미지를 모두 입력하세요. 인감은 PNG(투명배경) 권장.",
  },
  {
    problem: "공개 /projects 페이지에 프로젝트가 안 보입니다.",
    solution:
      "프로젝트 상세 → 공개 프로필 폼에서 'public' 토글이 켜져 있는지 확인. 60초 캐시(revalidate)로 즉시 반영되지 않을 수 있습니다.",
  },
  {
    problem: "AI 주간 보고서가 생성되지 않습니다.",
    solution:
      "프로젝트에 활동 로그(activity_logs)가 1건 이상 있어야 합니다. 마일스톤 상태 변경 / 피드백 작성 등을 먼저 발생시키세요.",
  },
  {
    problem: "고객이 포털 링크에 접속이 안 된다고 합니다.",
    solution:
      "토큰이 만료됐거나 프로젝트 상태가 archived일 수 있습니다. 프로젝트 상세에서 새 토큰을 발급해 다시 전달하세요.",
  },
] as const;

function Troubleshooting() {
  return (
    <section>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
        — Troubleshooting
      </p>
      <h2 className="font-heading text-2xl font-light leading-[1.2] tracking-[-0.02em] text-foreground md:text-3xl">
        문제 해결
      </h2>
      <dl className="mt-8 divide-y divide-foreground/10 border-t border-b border-foreground/10">
        {troubles.map((t, idx) => (
          <div key={t.problem} className="grid gap-3 py-6 md:grid-cols-[60px_1fr] md:gap-6">
            <dt className="flex items-start gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50">
              <AlertTriangle className="h-3.5 w-3.5 text-primary" />
              {String(idx + 1).padStart(2, "0")}
            </dt>
            <div>
              <p className="font-heading text-lg font-light leading-[1.3] text-foreground">
                {t.problem}
              </p>
              <dd className="mt-2 text-sm leading-[1.65] text-foreground/70">
                {t.solution}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────
export function GuideContent() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 py-10 md:space-y-20 md:py-12">
      {/* Page header */}
      <header>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
          — Help
        </p>
        <h1 className="font-heading text-4xl font-light leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
          대시보드 사용 설명서
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-[1.65] text-foreground/70">
          PM 워크플로우 4단계, 자주 쓰는 팁, 흔한 문제 해결법을 한 페이지에 정리.
          처음이라면 위에서 아래로 한 번 훑어보세요.
        </p>
      </header>

      <GettingStarted />
      <Workflow />
      <Tips />
      <Troubleshooting />

      {/* 닫는 멘트 */}
      <section className="border-t border-foreground/10 pt-12 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50">
          — Need More Help?
        </p>
        <h2 className="mt-4 font-heading text-2xl font-light text-foreground">
          빠진 내용이 있으면 알려주세요.
        </h2>
        <p className="mt-3 text-sm text-foreground/70">
          이 가이드는 계속 업데이트됩니다.
        </p>
      </section>
    </div>
  );
}
