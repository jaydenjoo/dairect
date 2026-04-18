/**
 * Dairect 데모 모드 가드 유틸 — Task 4-1 M2
 *
 * `/demo` 라우트에서 비로그인 방문자가 대시보드를 "체험"할 수 있도록, 모든 변경 액션을
 * 차단하고 Sonner 토스트로 안내한다.
 *
 * 사용 패턴:
 *   1. `/demo/layout.tsx`에서 `<DemoContextProvider>`로 감싸기
 *   2. 클라이언트 컴포넌트에서 `useDemoGuard()`로 hook 호출
 *   3. 클릭 핸들러 상단에서 `if (demoGuard("생성")) return;` 형태로 가드
 *
 * 또는 `DemoSafeButton`/`DemoSafeFormWrapper` 같은 wrapper 사용 시 자동 방어.
 *
 * Note: 이 모듈은 클라이언트 경계 (`"use client"`). 서버 컴포넌트에서는 Context를 쓸 수
 * 없으므로 레이아웃에서 provider 감싸면 내부 서브트리 전체가 데모 모드를 인식한다.
 */

"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { toast } from "sonner";

// ─── Context ───

const DemoContext = createContext<boolean>(false);

type ProviderProps = {
  children: ReactNode;
  /** true로 세팅하면 하위 트리 전체가 데모 모드로 동작 */
  isDemo?: boolean;
};

export function DemoContextProvider({ children, isDemo = true }: ProviderProps) {
  return <DemoContext.Provider value={isDemo}>{children}</DemoContext.Provider>;
}

// ─── 기본 Hook ───

/** 현재 서브트리가 데모 모드인지 조회. Provider 밖에서는 false 반환. */
export function useIsDemo(): boolean {
  return useContext(DemoContext);
}

// ─── 가드 Hook ───

const DEMO_TOAST_ID = "demo-mode-guard";
const DEMO_TOAST_MESSAGE = "데모 모드에서는 수정할 수 없습니다";

/**
 * 클릭 핸들러 상단에서 `if (demoGuard("생성")) return;` 형태로 가드.
 *
 * 반환값 true → 데모 모드 (토스트 이미 표시, 호출자는 즉시 반환해야 함)
 * 반환값 false → 실제 환경 (호출자는 로직 계속 진행)
 *
 * `intent` 파라미터는 토스트 설명문에 포함되어 "어떤 동작을 차단했는지" 안내 (선택).
 * 중복 토스트 방지를 위해 `toast()`에 고정 `id` 전달.
 */
export function useDemoGuard(): (intent?: string) => boolean {
  const isDemo = useIsDemo();
  return useCallback(
    (intent?: string) => {
      if (!isDemo) return false;
      toast.info(DEMO_TOAST_MESSAGE, {
        id: DEMO_TOAST_ID,
        description: intent
          ? `"${intent}" 동작은 실제 계정에서 사용할 수 있습니다. [로그인]으로 이동해보세요.`
          : "실제 계정에서 사용할 수 있습니다. [로그인]으로 이동해보세요.",
        duration: 3500,
      });
      return true;
    },
    [isDemo],
  );
}

// ─── 편의 Wrapper (선택) ───

type SafeHandler<E> = (event: E) => void;

type DemoSafeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  onClick?: SafeHandler<React.MouseEvent<HTMLButtonElement>>;
  /** 토스트에 표시될 의도 문구 (예: "생성" · "삭제" · "발송") */
  intent?: string;
  children: ReactNode;
};

/**
 * 데모 모드에서 클릭을 자동 차단하는 버튼. 실제 환경에서는 전달된 onClick 그대로 실행.
 *
 * 주의: 이 wrapper는 shadcn/ui `Button`의 `buttonVariants`를 적용하지 않는다. 스타일은
 * 호출측에서 `className`으로 전달. 구조적으로 단순한 `<button>`만 사용.
 */
export function DemoSafeButton({
  onClick,
  intent,
  children,
  type = "button",
  ...rest
}: DemoSafeButtonProps) {
  const demoGuard = useDemoGuard();
  const isDemo = useIsDemo();
  return (
    <button
      type={type}
      data-demo={isDemo ? "true" : undefined}
      aria-disabled={isDemo || undefined}
      onClick={(e) => {
        if (demoGuard(intent)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

// ─── Form 차단용 wrapper ───

type DemoSafeFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  onSubmit?: SafeHandler<React.FormEvent<HTMLFormElement>>;
  /** 토스트에 표시될 의도 문구 (예: "제출" · "저장") */
  intent?: string;
  children: ReactNode;
};

/**
 * 데모 모드에서 submit을 자동 차단하는 폼. `<form>` 자체는 정상 렌더되어 input focus·
 * 레이아웃은 그대로, submit만 막힘.
 */
export function DemoSafeForm({
  onSubmit,
  intent,
  children,
  ...rest
}: DemoSafeFormProps) {
  const demoGuard = useDemoGuard();
  const isDemo = useIsDemo();
  return (
    <form
      data-demo={isDemo ? "true" : undefined}
      onSubmit={(e) => {
        if (demoGuard(intent)) {
          e.preventDefault();
          return;
        }
        onSubmit?.(e);
      }}
      {...rest}
    >
      {children}
    </form>
  );
}
