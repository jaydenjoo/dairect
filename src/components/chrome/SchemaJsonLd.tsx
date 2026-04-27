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
  serviceType: "AI 개발 대행 (AI-powered software development)",
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
        name: "PKG N°00 — Sprint",
        description: "1주, 단일 기능 MVP",
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
        name: "PKG N°01 — Build",
        description: "3주, 라이브 제품 + 14일 슬랙 자문 (월 5회, 24h SLA)",
      },
      {
        "@type": "Offer",
        name: "PKG N°02 — Scale",
        description: "90일 파트너십, 사업화 동행",
      },
      {
        "@type": "Offer",
        name: "PKG N°03 — Enterprise",
        description: "맞춤 SI 수준 작업",
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
