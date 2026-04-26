import Script from "next/script";

// Day 3 P2-3 (2026-04-26): GA4 Script 로드.
// NEXT_PUBLIC_GA_MEASUREMENT_ID 미설정 시 null 반환 → Script 미로드.
// → src/lib/analytics.ts 의 track() 도 자동 no-op (window.gtag 미정의).

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Analytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
