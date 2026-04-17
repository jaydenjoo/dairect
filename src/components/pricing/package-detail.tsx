import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Zap,
  Rocket,
  FileText,
  Package,
  ArrowRight,
} from "lucide-react";

type PackageDetail = {
  id: string;
  name: string;
  price: string;
  duration: string;
  durationIcon: typeof Clock;
  pitch: string;
  includes: string[];
  deliverables: string[];
  suitable: string;
  featured?: boolean;
};

const packages: PackageDetail[] = [
  {
    id: "diagnosis",
    name: "진단 패키지",
    price: "30만원~",
    duration: "3~5일",
    durationIcon: Clock,
    pitch:
      "아이디어 실현 가능성을 전문가 관점에서 진단합니다. 어떤 방향이 최선인지 확신이 없을 때 시작점이 되어드립니다.",
    includes: [
      "아이디어 분석 리포트 (실현 가능성 · 위험 요소 · 시장성)",
      "핵심 기능 정의서 (필수 기능 vs 후순위 기능 분리)",
      "기술 스택 추천 3안 (비용 · 난이도 · 확장성 비교)",
      "3단계 개발 로드맵 (MVP → 검증 → 확장 순서)",
    ],
    deliverables: [
      "10~15장 분량 진단 보고서 PDF",
      "기술 스택 비교표 (스프레드시트)",
      "90분 전문가 브리핑 미팅",
    ],
    suitable:
      "아이디어만 있고 아직 방향이 서지 않았을 때. 친구나 전문가에게 물어봐도 뚜렷한 답이 없었다면 여기서 시작하세요.",
  },
  {
    id: "mvp",
    name: "MVP 패키지",
    price: "100만원~",
    duration: "2~3주",
    durationIcon: Zap,
    pitch:
      "핵심 기능 1개를 실제 작동하는 프로토타입으로 만들어드립니다. 시장 반응을 빠르게 확인하고 싶을 때 가장 경제적인 선택.",
    includes: [
      "진단 패키지 전체 포함",
      "핵심 기능 1개 전체 개발 (프론트+백엔드+DB)",
      "Vercel / Netlify 실 배포 + HTTPS",
      "2주간 무상 수정 (요구사항 내 조정)",
      "사용자 가이드 문서 (스크린샷 포함)",
    ],
    deliverables: [
      "실제 작동하는 웹/앱 프로토타입",
      "공개 접속 URL (예: app.yourname.com 연결 가능)",
      "관리자용 가이드 문서",
      "소스 코드 이관 (GitHub private repo)",
    ],
    suitable:
      "가설을 빠르게 검증하고 싶을 때. 투자 유치나 사전 예약 받기 전 실물 데모가 필요할 때 최적.",
    featured: true,
  },
  {
    id: "expansion",
    name: "확장 패키지",
    price: "300만원~",
    duration: "4~8주",
    durationIcon: Rocket,
    pitch:
      "MVP를 정식 서비스로 확장합니다. 여러 기능과 운영 환경이 필요한 단계로 넘어가실 때.",
    includes: [
      "MVP 패키지 전체 포함",
      "추가 기능 3~5개 개발 (결제·알림·관리자 페이지 등)",
      "커스텀 도메인 + HTTPS + CDN 설정",
      "운영 모니터링 기본 설정 (에러 추적 · 분석)",
      "6개월 운영 가이드 + 월 1회 이슈 대응 (2개월 한정)",
    ],
    deliverables: [
      "정식 서비스 배포본",
      "관리자 대시보드",
      "운영 가이드북 (장애 대응 · 백업 · 업데이트 절차)",
      "소스 코드 + 인프라 구성 문서 이관",
    ],
    suitable:
      "MVP 검증을 마치고 정식 서비스로 전환할 때. 또는 처음부터 여러 기능이 동시에 필요한 B2B 프로젝트.",
  },
];

export function PackageDetails() {
  return (
    <section className="surface-base py-24 md:py-32">
      <div className="mx-auto max-w-5xl space-y-24 px-6 md:px-8">
        {packages.map((pkg) => {
          const DurationIcon = pkg.durationIcon;
          return (
            <article
              key={pkg.id}
              id={pkg.id}
              className="scroll-mt-28"
            >
              <header className="mb-10">
                {pkg.featured && (
                  <span className="soul-gradient mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white">
                    가장 많이 선택해요
                  </span>
                )}
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                      {pkg.name}
                    </h2>
                    <p
                      className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground"
                      style={{ wordBreak: "keep-all" }}
                    >
                      {pkg.pitch}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`font-heading font-extrabold tracking-tight ${
                        pkg.featured ? "text-4xl text-primary" : "text-3xl text-foreground"
                      }`}
                    >
                      {pkg.price}
                    </span>
                    <span className="surface-high inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
                      <DurationIcon className="h-3.5 w-3.5" />
                      {pkg.duration}
                    </span>
                  </div>
                </div>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="surface-card rounded-2xl p-8 shadow-ambient">
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      포함 항목
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span
                          className="text-sm leading-relaxed text-foreground"
                          style={{ wordBreak: "keep-all" }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="surface-card rounded-2xl p-8 shadow-ambient">
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      예상 산출물
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {pkg.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span
                          className="text-sm leading-relaxed text-muted-foreground"
                          style={{ wordBreak: "keep-all" }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="surface-low mt-6 rounded-2xl p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  이런 분께 적합합니다
                </p>
                <p
                  className="mt-2 text-base leading-relaxed text-foreground"
                  style={{ wordBreak: "keep-all" }}
                >
                  {pkg.suitable}
                </p>
              </div>

              <div className="mt-8 flex justify-end">
                <Link
                  href={`/about?package=${pkg.id}#contact`}
                  className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                    pkg.featured
                      ? "soul-gradient text-white shadow-ambient-lg hover:brightness-110"
                      : "surface-high text-foreground hover:bg-accent/50"
                  }`}
                >
                  {pkg.name} 상담 신청하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
