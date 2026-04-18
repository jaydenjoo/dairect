"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PortalError({ error, reset }: Props) {
  // 에러 내부 메시지는 고객에게 노출하지 않음. 담당자에게 digest만 공유 가능.
  return (
    <div className="pt-24 pb-24 md:pt-32">
      <div className="mx-auto max-w-xl px-6 text-center md:px-8">
        <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          페이지를 불러오지 못했어요
        </h1>
        <p
          className="mx-auto mt-3 max-w-md text-sm text-muted-foreground"
          style={{ wordBreak: "keep-all" }}
        >
          일시적인 문제일 수 있습니다. 잠시 후 다시 시도해주세요. 계속 발생하면 담당
          PM에게 알려주세요.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            {/* 전체 digest는 fingerprint 가능성이 있어 앞 8자만 노출. 전체 값은 서버 로그 보관. */}
            참조 코드: {error.digest.slice(0, 8)}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" onClick={reset} size="sm">
            다시 시도
          </Button>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
