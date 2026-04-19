"use client";

/**
 * 봇 전용 미끼 입력 필드 (controlled component).
 *
 * 방어 매트릭스 — 사람·봇 모든 채널에서 채울 동기 제거:
 *   - 사람 눈              → off-screen (-9999px) + opacity:0 + h:0/w:0
 *   - 키보드 사용자        → tabIndex={-1}
 *   - 스크린리더          → aria-hidden="true"
 *   - 패스워드 매니저/autofill → autoComplete="off"
 *   - pointer 이벤트       → pointer-events-none
 *
 * 부모 컴포넌트가 value/onChange로 "봇 채움" 감지.
 * 서버 측 핸들러에서 `submission.website && length > 0`이면 success 위장 응답으로 드롭.
 *
 * baseline 통합 출처:
 *   - src/components/about/contact-form.tsx (랜딩 contact)
 *   - src/components/portal/portal-feedback-form.tsx (포털 피드백)
 */
interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
  /**
   * input name. 기본 `"website"` — 봇이 가장 잘 채우는 이름.
   * 같은 페이지에 여러 폼이 있으면 충돌 방지를 위해 override.
   */
  name?: string;
}

export function HoneypotField({
  value,
  onChange,
  name = "website",
}: HoneypotFieldProps) {
  return (
    <input
      type="text"
      name={name}
      aria-hidden="true"
      tabIndex={-1}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
    />
  );
}
