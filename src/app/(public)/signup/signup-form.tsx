"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signupFormSchema } from "@/lib/validation/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { safeNext } from "@/lib/utils/safe-next";

// 회원가입 폼 client component.
// 성공 시 동작:
//   - data.session 존재 (local enable_confirmations=false): next(기본 /dashboard) 즉시 redirect + refresh
//   - data.session null (production enable_confirmations=true): "확인 메일 발송됨" 안내 UI
//     (확인 메일의 링크가 /auth/callback?next=<encoded>로 돌아와 next로 최종 이동)
export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  // Phase 5 Task 5-2-5: /invite/[token] → /login → /signup 경로에서 next 보존.
  // safeNext: backslash bypass + protocol-relative + 제어문자 모두 차단.
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = signupFormSchema.safeParse({
      email,
      password,
      confirmPassword,
      name: name || undefined,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "입력값을 확인해주세요");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        // next 보존: 확인 메일 링크 → /auth/callback?next=<encoded> → 최종 next로 이동
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: { name: parsed.data.name ?? null },
      },
    });

    if (error) {
      // Supabase는 이미 가입된 이메일도 특정 경우 성공 응답을 주기 때문에(enumeration 방어)
      // 명시적 에러만 메시지 노출. 아래는 보편적 fallback.
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        setFormError("이미 가입된 이메일입니다. 로그인해주세요.");
      } else if (msg.includes("password")) {
        setFormError("비밀번호가 보안 정책을 충족하지 않습니다.");
      } else {
        setFormError("가입에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
      setLoading(false);
      return;
    }

    // session 있음 → 즉시 로그인 상태. next(기본 /dashboard)로 진입.
    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }

    // session 없음 → email confirmation 플로우. Supabase가 확인 메일 발송한 상태.
    setPendingConfirm(true);
    setLoading(false);
  };

  const errorMessage = callbackError
    ? "인증에 실패했습니다. 다시 시도해주세요."
    : formError;

  if (pendingConfirm) {
    return (
      <div className="flex min-h-screen items-center justify-center surface-base px-4 py-12">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="surface-card space-y-4 rounded-xl p-8 shadow-ambient">
            <h1 className="font-heading text-xl font-bold text-primary">확인 메일이 발송되었어요</h1>
            <p className="text-sm text-muted-foreground">
              <strong>{email}</strong>으로 보낸 확인 링크를 클릭하면 가입이 완료됩니다.
            </p>
            <p className="text-xs text-muted-foreground">
              메일이 오지 않으면 스팸함을 확인해주세요.
            </p>
          </div>
          <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center surface-base px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-primary">dairect</h1>
          <p className="mt-2 text-sm text-muted-foreground">새 계정 만들기</p>
        </div>

        <div className="surface-card space-y-6 rounded-xl p-8 shadow-ambient">
          {errorMessage && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="signup-name" className="mb-1.5 block">
                이름 <span className="text-muted-foreground text-xs">(선택)</span>
              </Label>
              <Input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                maxLength={50}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="signup-email" className="mb-1.5 block">
                이메일
              </Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                maxLength={200}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="signup-password" className="mb-1.5 block">
                비밀번호
              </Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
                required
                minLength={8}
                maxLength={200}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="signup-confirm" className="mb-1.5 block">
                비밀번호 확인
              </Label>
              <Input
                id="signup-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="동일하게 입력"
                required
                minLength={8}
                maxLength={200}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              가입하기
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link
              href={`/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="text-primary hover:underline"
            >
              로그인
            </Link>
          </div>
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
