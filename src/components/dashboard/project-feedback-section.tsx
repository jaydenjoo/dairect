"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, MessageSquare, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markFeedbackReadAction } from "@/app/dashboard/projects/[id]/feedback-actions";
import type { ProjectFeedbackItem } from "@/types/project-feedback";

// KST(+9h) 표시 — PM 대시보드는 한국 내부 사용자 전용이라 로컬 시간이 자연스러움.
// UTC 타임스탬프에 9시간 오프셋을 수동 가산해 Intl.DateTimeFormat 없이 SSR/CSR 일치 보장.
// 포털 쪽(`/portal/[token]`)은 UTC 고정 정책이라 서로 의도적으로 다름.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function formatDateTimeKST(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  const hh = String(kst.getUTCHours()).padStart(2, "0");
  const mi = String(kst.getUTCMinutes()).padStart(2, "0");
  return `${y}.${m}.${day} ${hh}:${mi}`;
}

// IP 뒷자리 마스킹 — PM 뷰에도 원본 전체 노출은 불요. 대략적 위치 식별용.
// 방어 범위:
// - IPv4: "a.b.c.d" → "a.b.c.*"
// - IPv4-mapped IPv6: "::ffff:a.b.c.d" → IPv4 규칙 재적용 ("a.b.c.*")
// - 순수 IPv6: 첫 2 그룹만 보존 (`:` 구분자 기준). fallback은 "—".
function maskIp(raw: string | null): string {
  if (!raw) return "—";
  const trimmed = raw.trim();

  // IPv4-mapped IPv6 → IPv4 옥텟만 추출 후 동일 규칙.
  const mapped = trimmed.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/i);
  if (mapped) return `${mapped[1]}.*`;

  // IPv4
  const v4 = trimmed.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if (v4) return `${v4[1]}.*`;

  // 순수 IPv6 (`:` 포함). 첫 2 그룹만 보존.
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").filter((p) => p.length > 0);
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}::*`;
  }

  return "—";
}

function summarizeUserAgent(raw: string | null): string {
  if (!raw) return "—";
  // 순서 주의: iOS UA에 "Mac OS X"가 포함되므로 iPhone/iPad를 먼저 체크.
  if (/iPhone|iPad/i.test(raw)) return "iOS";
  if (/Android/i.test(raw)) return "Android";
  if (/Mac OS X/i.test(raw)) return "macOS";
  if (/Windows/i.test(raw)) return "Windows";
  if (/Linux/i.test(raw)) return "Linux";
  // fallback으로 원문 일부를 노출하면 UA에 심은 피싱 URL 등이 그대로 표시될 수 있어
  // generic "기타"로 대체. 감사가 필요한 케이스는 DB 원본 조회로 확인.
  return "기타";
}

interface Props {
  items: ProjectFeedbackItem[];
}

export function ProjectFeedbackSection({ items }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleToggle = (id: string, nextIsRead: boolean) => {
    setPendingId(id);
    startTransition(async () => {
      try {
        const result = await markFeedbackReadAction({
          feedbackId: id,
          action: nextIsRead ? "read" : "unread",
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(nextIsRead ? "읽음 처리했어요" : "읽지 않음으로 되돌렸어요");
        // revalidatePath만으로는 RSC payload가 즉시 갱신되지 않을 수 있음 — router.refresh로 강제.
        router.refresh();
      } finally {
        // 성공/실패/예외 모든 경로에서 pending 해제.
        setPendingId(null);
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-card p-8 text-center shadow-ambient">
        <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
        </div>
        <p className="text-sm text-muted-foreground">
          아직 고객이 남긴 피드백이 없습니다. 포털 링크를 공유한 뒤 고객 입력을
          기다려주세요.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((fb) => {
        const isPending = pendingId === fb.id;
        return (
          <li
            key={fb.id}
            className="relative overflow-hidden rounded-xl bg-card p-5 shadow-ambient"
          >
            {/* 미확인 accent bar — No-Line Rule 대신 bg 전환으로 경계 표시 */}
            {!fb.isRead && (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-1 bg-primary"
              />
            )}
            <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{formatDateTimeKST(fb.createdAt)}</span>
                <span className="text-muted-foreground/60">·</span>
                <span className="font-mono">{maskIp(fb.clientIp)}</span>
                <span className="text-muted-foreground/60">·</span>
                <span>{summarizeUserAgent(fb.userAgent)}</span>
              </div>
              {fb.isRead ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  <Check className="h-3 w-3" />
                  읽음
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  미확인
                </span>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap pl-2 text-sm leading-relaxed text-foreground">
              {fb.message}
            </p>
            <div className="mt-4 flex items-center gap-2 pl-2">
              {fb.isRead ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => handleToggle(fb.id, false)}
                  className="text-muted-foreground"
                >
                  <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                  읽음 해제
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => handleToggle(fb.id, true)}
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  {isPending ? "처리 중..." : "읽음 처리"}
                </Button>
              )}
              {fb.readAt && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {formatDateTimeKST(fb.readAt)} 확인
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
