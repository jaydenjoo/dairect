import type { ReactNode } from "react";

/**
 * DB 에 저장된 description 문자열을 JSX ReactNode 로 변환.
 *
 * DB 스토리지 규칙:
 *   *text* → <em>text</em>
 *   (단일 백틱/이중 강조 등 기타 markdown 문법 미지원 — 번들 디자인에 없음)
 *
 * 예:
 *   "82%를 AI가 *자동 응답*으로 처리" → "82%를 AI가 <em>자동 응답</em>으로 처리"
 *
 * 보안: 임의 HTML 삽입 불가. '*' 쌍 사이 텍스트를 React 의 <em> 엘리먼트로만 감쌈.
 */
export function parseEmphasis(raw: string): ReactNode {
  if (!raw) return raw;

  // * 로 split — 짝수 인덱스는 평문, 홀수 인덱스는 <em>
  const parts = raw.split("*");
  // 닫히지 않은 '*' (홀수 개) 는 평문 처리 (보수적 fallback)
  if (parts.length % 2 === 0) {
    return raw;
  }

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 0 ? (
          part
        ) : (
          <em key={i}>{part}</em>
        )
      )}
    </>
  );
}
