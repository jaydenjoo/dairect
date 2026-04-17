"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import {
  type PackageId,
  type BudgetId,
  type ScheduleId,
  packageLabel,
} from "@/lib/validation/inquiry";
import {
  submitInquiryAction,
  type InquirySubmission,
} from "@/app/(public)/about/actions";

const budgetOptions: { id: BudgetId; label: string }[] = [
  { id: "under_100", label: "100만원 미만" },
  { id: "100_to_300", label: "100~300만원" },
  { id: "over_300", label: "300만원 이상" },
  { id: "unsure", label: "잘 모르겠음" },
];

const scheduleOptions: { id: ScheduleId; label: string }[] = [
  { id: "within_1month", label: "1개월 내" },
  { id: "1_to_3months", label: "1~3개월" },
  { id: "flexible", label: "여유 있음" },
];

interface Props {
  initialPackage?: PackageId;
}

export function ContactForm({ initialPackage }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [pkg, setPkg] = useState<PackageId | undefined>(initialPackage);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [ideaSummary, setIdeaSummary] = useState("");
  const [description, setDescription] = useState("");
  const [budgetRange, setBudgetRange] = useState<BudgetId | "">("");
  const [schedule, setSchedule] = useState<ScheduleId | "">("");
  const [website, setWebsite] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;

    const submission: InquirySubmission = {
      name,
      contact,
      ideaSummary,
      description,
      budgetRange: budgetRange || undefined,
      schedule: schedule || undefined,
      package: pkg,
      website,
      startedAt,
    };

    startTransition(async () => {
      const res = await submitInquiryAction(submission);
      if (res.success) {
        setSubmitted(true);
      } else {
        toast.error(res.error ?? "문의 접수 중 오류가 발생했습니다");
      }
    });
  }

  if (submitted) {
    return (
      <div className="relative mx-auto max-w-2xl rounded-[28px] surface-card shadow-ambient-lg">
        <div className="flex flex-col items-center gap-6 px-8 py-16 text-center md:px-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={2.2} />
          </div>
          <h3
            className="font-heading text-3xl font-bold tracking-tight text-foreground"
            style={{ letterSpacing: "-0.02em", wordBreak: "keep-all" }}
          >
            문의가 접수되었습니다
          </h3>
          <p
            className="text-base leading-relaxed text-muted-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            24시간 내 <span className="font-semibold text-foreground">{contact}</span>(으)로 연락드리겠습니다.
            <br />
            편하게 기다려주세요.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            홈으로 돌아가기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative mx-auto max-w-2xl rounded-[28px] surface-card shadow-ambient-lg"
    >
      {/* Honeypot — 봇 방어 (시각적/스크린리더 비노출) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="flex flex-col gap-7 px-6 py-10 md:px-10 md:py-12">
        {/* 선택된 패키지 뱃지 — 취소 가능 */}
        {pkg && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-primary/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden />
              <span className="text-sm text-muted-foreground">
                선택한 패키지:{" "}
                <span className="font-semibold text-primary">
                  {packageLabel[pkg]}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPkg(undefined)}
              aria-label="패키지 선택 취소"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/[0.08] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 이름 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="inquiry-name"
            className="text-sm font-semibold text-foreground"
          >
            이름 <span className="text-primary">*</span>
          </label>
          <input
            id="inquiry-name"
            name="name"
            type="text"
            required
            maxLength={50}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="h-12 rounded-xl surface-base px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* 연락처 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="inquiry-contact"
            className="text-sm font-semibold text-foreground"
          >
            연락처 <span className="text-primary">*</span>
          </label>
          <input
            id="inquiry-contact"
            name="contact"
            type="text"
            required
            maxLength={100}
            inputMode="email"
            autoComplete="email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="전화번호 또는 이메일"
            className="h-12 rounded-xl surface-base px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* 아이디어 요약 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="inquiry-idea"
            className="text-sm font-semibold text-foreground"
          >
            아이디어 한줄 요약
          </label>
          <input
            id="inquiry-idea"
            name="ideaSummary"
            type="text"
            maxLength={100}
            value={ideaSummary}
            onChange={(e) => setIdeaSummary(e.target.value)}
            placeholder="어떤 서비스를 구상 중이신가요?"
            className="h-12 rounded-xl surface-base px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* 상세 설명 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="inquiry-description"
            className="text-sm font-semibold text-foreground"
          >
            상세 설명
          </label>
          <textarea
            id="inquiry-description"
            name="description"
            rows={5}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="세부 내용을 적어주시면 더 정확한 상담이 가능합니다."
            className="resize-none rounded-xl surface-base px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* 예산 범위 */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold text-foreground">
            예산 범위
          </legend>
          <div className="grid grid-cols-2 gap-2.5">
            {budgetOptions.map((opt) => {
              const selected = budgetRange === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`relative flex cursor-pointer items-center justify-center rounded-xl px-4 py-3.5 text-sm font-medium transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-offset-2 focus-within:ring-offset-[var(--surface-container-lowest)] ${
                    selected
                      ? "bg-primary/[0.08] text-primary ghost-border"
                      : "surface-base text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="budgetRange"
                    value={opt.id}
                    checked={selected}
                    onChange={() => setBudgetRange(opt.id)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 희망 일정 */}
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold text-foreground">
            희망 일정
          </legend>
          <div className="grid grid-cols-3 gap-2.5">
            {scheduleOptions.map((opt) => {
              const selected = schedule === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`relative flex cursor-pointer items-center justify-center rounded-xl px-3 py-3.5 text-sm font-medium transition-all focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-offset-2 focus-within:ring-offset-[var(--surface-container-lowest)] ${
                    selected
                      ? "bg-primary/[0.08] text-primary ghost-border"
                      : "surface-base text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule"
                    value={opt.id}
                    checked={selected}
                    onChange={() => setSchedule(opt.id)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isPending}
          className="soul-gradient group mt-2 inline-flex h-14 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-white shadow-ambient transition-all hover:shadow-ambient-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            "전송 중..."
          ) : (
            <>
              문의 보내기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        {/* 개인정보 문구 */}
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          제출 시{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-foreground"
          >
            개인정보 처리방침
          </Link>
          에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </form>
  );
}
