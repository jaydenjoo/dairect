"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitPortalFeedbackAction } from "@/lib/portal/feedback-actions";
import type { PortalFeedbackActionResult } from "@/lib/validation/portal-feedback";
import { FEEDBACK_MESSAGE_MAX } from "@/lib/validation/portal";
import { HoneypotField } from "@/components/security/honeypot-field";

interface Props {
  token: string;
}

export function PortalFeedbackForm({ token }: Props) {
  // 폼 첫 렌더 시각 — timing guard용. lazy init으로 React purity 유지 (Task 4-2 M3 교훈).
  // "추가 피드백 남기기" 재시작 시 setStartedAt으로 갱신해 2차 제출에도 3초 가드 유효화.
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      setErrorMsg("내용을 입력해주세요");
      return;
    }

    startTransition(async () => {
      const result: PortalFeedbackActionResult = await submitPortalFeedbackAction(
        token,
        {
          message: trimmed,
          website: honeypot,
          startedAt,
        },
      );
      if (!result.success) {
        setErrorMsg(result.error ?? "잠시 후 다시 시도해주세요");
        return;
      }
      setIsSubmitted(true);
      setMessage("");
    });
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrorMsg(null);
    setStartedAt(Date.now());
  };

  const remaining = FEEDBACK_MESSAGE_MAX - message.length;

  return (
    <section
      aria-labelledby="portal-feedback-heading"
      className="pb-20 md:pb-28"
    >
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <div className="mb-6">
          <h2
            id="portal-feedback-heading"
            className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground"
          >
            의견 남기기
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            프로젝트 진행에 대한 의견이나 요청 사항을 자유롭게 남겨주세요. 담당 PM이
            확인 후 답변드려요.
          </p>
        </div>

        {isSubmitted ? (
          <div className="surface-card rounded-2xl p-6 shadow-ambient">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  의견이 전달되었어요
                </h3>
                <p
                  className="mt-1 text-sm text-muted-foreground"
                  style={{ wordBreak: "keep-all" }}
                >
                  담당 PM이 확인 후 연락드릴게요. 추가로 남기실 의견이 있다면 아래
                  버튼으로 작성해주세요.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  추가 피드백 남기기
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="surface-card rounded-2xl p-5 shadow-ambient md:p-6"
            noValidate
          >
            {/* honeypot — src/components/security/honeypot-field.tsx 공용 컴포넌트.
                방어 매트릭스(시각/키보드/SR/autofill/pointer)는 거기 정의. */}
            <HoneypotField value={honeypot} onChange={setHoneypot} />

            <label
              htmlFor="portal-feedback-message"
              className="text-sm font-semibold text-foreground"
            >
              피드백 내용
            </label>
            <textarea
              id="portal-feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={FEEDBACK_MESSAGE_MAX}
              required
              disabled={isPending}
              placeholder="예) 메인 페이지 레이아웃이 모바일에서 약간 좁아 보여요. 패딩을 조금만 키워주실 수 있을까요?"
              aria-describedby="portal-feedback-remaining portal-feedback-error"
              className="mt-2 min-h-[140px] w-full resize-y rounded-xl bg-muted/50 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/40 disabled:opacity-60 md:min-h-[160px]"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span
                id="portal-feedback-remaining"
                className="font-mono text-xs text-muted-foreground"
              >
                {remaining.toLocaleString("ko-KR")}자 남음
              </span>
              <button
                type="submit"
                disabled={isPending || message.trim().length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-ambient transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {isPending ? "전송 중..." : "의견 보내기"}
              </button>
            </div>

            <p
              id="portal-feedback-error"
              aria-live="polite"
              className={`mt-3 text-sm ${errorMsg ? "text-rose-600" : "sr-only"}`}
            >
              {errorMsg ?? ""}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
