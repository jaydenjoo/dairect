const SITE_URL = "https://dairect.kr";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "dairect",
  alternateName: "Director of AI, working Direct",
  url: SITE_URL,
  email: "hello@dairect.kr",
  description:
    "AI 개발 대행 1인 스튜디오. 일반 개발사 3개월 → 3주. 코드는 AI(Claude)가, 방향은 디렉터가 직접.",
  foundingDate: "2024",
  slogan: "코드는 AI가, 방향은 내가",
  logo: `${SITE_URL}/icons/icon-512.png`,
  image: `${SITE_URL}/icons/icon-512.png`,
  // 2026-04-27 Findably GEO 강화: AI 검색(ChatGPT/Claude/Perplexity)이 "이 회사가
  // 어떤 분야 전문가인가" 판단하는 명찰. 타겟 키워드 + 도메인 7개를 명시해
  // "AI 개발 프리랜서" / "MVP 개발" 같은 검색에서 인용 가능성 향상.
  knowsAbout: [
    "AI 활용 웹 개발",
    "프리랜서 개발 대행 서비스",
    "MVP 빠른 개발",
    "Claude Code 활용 개발",
    "Next.js Supabase 풀스택 개발",
    "비개발자 창업가 IT 지원",
    "스타트업 제품 개발 동행",
  ],
  sameAs: [SITE_URL],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Seoul",
    addressCountry: "KR",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@dairect.kr",
    contactType: "customer support",
    availableLanguage: ["ko", "en"],
  },
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "dairect",
  url: SITE_URL,
  inLanguage: "ko-KR",
  publisher: { "@type": "Organization", name: "dairect", url: SITE_URL },
};

const service = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "AI 활용 커스텀 소프트웨어 개발",
  // 2026-04-27 Findably GEO 강화: 단일 serviceType 외 다양한 검색 진입점을 위해
  // category 다축 명시 (AI 검색이 서비스 유형 매칭 정확도 향상).
  category: [
    "AI 개발 프리랜서",
    "MVP 개발 대행",
    "비개발자 IT 솔루션",
    "스타트업 풀스택 개발",
  ],
  provider: { "@type": "Organization", name: "dairect", url: SITE_URL },
  areaServed: { "@type": "Country", name: "South Korea" },
  description:
    "아이디어를 라이브 제품으로. AI 코드 생성 + 디렉터 검수 방식으로 SI/시니어/중급 대비 1/3~1/10 가격에 3주 출시.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "dairect 패키지",
    itemListElement: [
      {
        "@type": "Offer",
        name: "PKG N°00 — Discovery (체험)",
        description: "3~5일, 아이디어 작동 가능 여부 진단",
        price: "900000",
        priceCurrency: "KRW",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: "900000",
          priceCurrency: "KRW",
          valueAddedTaxIncluded: false,
        },
      },
      {
        "@type": "Offer",
        name: "PKG N°01 — Sprint (검증)",
        description: "5~10일, 핵심 가설 작동 검증",
        price: "1800000",
        priceCurrency: "KRW",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: "1800000",
          priceCurrency: "KRW",
          valueAddedTaxIncluded: false,
        },
      },
      {
        "@type": "Offer",
        name: "PKG N°02 — Build (MVP)",
        description:
          "2~3주, 사용자에게 보여줄 첫 버전 + 14일 슬랙 자문 (월 5회, 24h SLA)",
        price: "3000000",
        priceCurrency: "KRW",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: "3000000",
          priceCurrency: "KRW",
          valueAddedTaxIncluded: false,
        },
      },
      {
        "@type": "Offer",
        name: "PKG N°03 — Scale (확장)",
        description: "4~8주, MVP 이후 본격 운영 인프라 + 90일 파트너십",
        price: "8000000",
        priceCurrency: "KRW",
        priceSpecification: {
          "@type": "PriceSpecification",
          price: "8000000",
          priceCurrency: "KRW",
          valueAddedTaxIncluded: false,
        },
      },
    ],
  },
};

export function SchemaJsonLd() {
  const blocks = [organization, website, service];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
