"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { safeNext } from "@/lib/utils/safe-next";

const emailSchema = z.string().trim().email("올바른 이메일 형식이 아닙니다").max(200);
const passwordSchema = z.string().min(8, "비밀번호는 8자 이상이어야 합니다").max(200);

type LoadingMode = "google" | "email" | null;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  // Phase 5 Task 5-2-5: /invite/[token]에서 미로그인 시 ?next=/invite/<token>으로 리다이렉트되어 옴.
  // 로그인 성공 후 next로 복귀 (기본값 /dashboard).
  //
  // safeNext 유틸: `//evil.com` + `/\evil.com`(backslash bypass) + 제어문자 차단.
  // 상세 로직/위협 모델은 @/lib/utils/safe-next 주석 참조.
  const next = safeNext(searchParams.get("next"));

  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingMode, setLoadingMode] = useState<LoadingMode>(null);

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setLoadingMode("google");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // auth/callback이 next 쿼리를 읽어 최종 리다이렉트 처리 (이미 open redirect 방지 로직 있음)
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setLoginError(error.message);
      setLoadingMode(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailCheck = emailSchema.safeParse(email);
    if (!emailCheck.success) {
      setLoginError(emailCheck.error.issues[0]?.message ?? "이메일을 확인해주세요");
      return;
    }
    const passwordCheck = passwordSchema.safeParse(password);
    if (!passwordCheck.success) {
      setLoginError(passwordCheck.error.issues[0]?.message ?? "비밀번호를 확인해주세요");
      return;
    }

    setLoadingMode("email");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: emailCheck.data,
      password: passwordCheck.data,
    });
    if (error) {
      setLoginError("이메일 또는 비밀번호가 올바르지 않습니다");
      setLoadingMode(null);
      return;
    }
    router.push(next);
    router.refresh();
  };

  const errorMessage = callbackError
    ? "인증에 실패했습니다. 다시 시도해주세요."
    : loginError;

  const disabled = loadingMode !== null;

  return (
    <div className="flex min-h-screen items-center justify-center surface-base px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-primary">dairect</h1>
          <p className="mt-2 text-sm text-muted-foreground">대시보드에 로그인하세요</p>
        </div>

        <div className="surface-card space-y-6 rounded-xl p-8 shadow-ambient">
          {errorMessage && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={disabled}
            className="flex w-full items-center justify-center gap-3 rounded-lg surface-high px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[#E7E7E5] disabled:opacity-60"
          >
            {loadingMode === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Google 계정으로 로그인
          </button>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-foreground/10" />
            또는
            <div className="h-px flex-1 bg-foreground/10" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <Label htmlFor="login-email" className="mb-1.5 block">
                이메일
              </Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                maxLength={200}
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="login-password" className="mb-1.5 block">
                비밀번호
              </Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
                required
                minLength={8}
                maxLength={200}
                disabled={disabled}
              />
            </div>
            <Button type="submit" className="w-full" disabled={disabled}>
              {loadingMode === "email" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              이메일로 로그인
            </Button>
          </form>

          {/*
           * Task-S2b (2026-04-24 末 v3.2): 1차 잠금 — 회원가입 공개 차단.
           * /signup 페이지 자체가 notFound()이므로 이 링크도 주석 처리. 2차 진입 시 이 블록 복구.
           */}
          {/*
          <div className="text-center text-xs text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link
              href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="text-primary hover:underline"
            >
              회원가입
            </Link>
          </div>
          */}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            ← dairect.kr 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
