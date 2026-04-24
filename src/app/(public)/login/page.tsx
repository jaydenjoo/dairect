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

const emailSchema = z
  .string()
  .trim()
  .email("올바른 이메일 형식이 아닙니다")
  .max(200);
const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다")
  .max(200);

type LoadingMode = "google" | "email" | null;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
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
      setLoginError(
        emailCheck.error.issues[0]?.message ?? "이메일을 확인해주세요"
      );
      return;
    }
    const passwordCheck = passwordSchema.safeParse(password);
    if (!passwordCheck.success) {
      setLoginError(
        passwordCheck.error.issues[0]?.message ?? "비밀번호를 확인해주세요"
      );
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
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-light italic text-ink">
            dairect<span className="text-signal not-italic">.</span>
          </h1>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-dust">
            — Sign in to dashboard
          </p>
        </div>

        <div
          className="space-y-6 bg-paper p-8"
          style={{
            border: "1px solid var(--hairline-canvas)",
            boxShadow: "4px 4px 0 var(--ink)",
          }}
        >
          {errorMessage && (
            <div
              className="p-3 font-mono text-[12px] text-ink"
              role="alert"
              style={{
                border: "1px solid var(--signal)",
                background: "rgba(255, 184, 0, 0.1)",
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={disabled}
            className="flex w-full items-center justify-center gap-3 bg-canvas px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-[rgba(139,134,128,0.1)] disabled:opacity-60"
            style={{ border: "1px solid var(--hairline-canvas)" }}
          >
            {loadingMode === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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

          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-dust">
            <div className="h-px flex-1 bg-hairline-canvas" />
            또는
            <div className="h-px flex-1 bg-hairline-canvas" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <Label
                htmlFor="login-email"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-dust"
              >
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
              <Label
                htmlFor="login-password"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-dust"
              >
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
        </div>

        <p className="text-center font-mono text-[11px] uppercase tracking-[0.12em] text-dust">
          <Link
            href="/"
            className="transition-colors hover:text-signal"
          >
            ← dairect.kr
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
