/**
 * 데모에서 아직 노출되지 않은 영역 안내 — Task 4-1 M5
 *
 * 사이드바 네비에서 `/demo/leads`/`/demo/contracts`/`/demo/invoices`/`/demo/settings` 클릭 시
 * 404 대신 이 섹션을 보여준다. 로그인 CTA + 로그인 후 이용 가능한 기능 설명.
 */

import Link from "next/link";
import { Lock } from "lucide-react";

type Props = {
  title: string;
  description: string;
};

export function UnavailableSection({ title, description }: Props) {
  return (
    <div className="py-10">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>

      <div className="mt-8 rounded-xl bg-card p-12 text-center shadow-ambient">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="mt-5 font-heading text-lg font-semibold text-foreground">
          데모에서는 미리보기만 지원합니다
        </h2>
        <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
          {description}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          로그인하고 실제 기능 사용하기 →
        </Link>
      </div>
    </div>
  );
}
