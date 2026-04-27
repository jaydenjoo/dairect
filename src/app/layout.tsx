import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import { DariWidget } from "@/components/chrome/DariWidget";
import { Analytics } from "@/components/chrome/Analytics";
import { SchemaJsonLd } from "@/components/chrome/SchemaJsonLd";
import { SerwistProvider } from "./serwist";
import "./globals.css";

const APP_NAME = "Dairect";
const APP_DEFAULT_TITLE = "dairect — 머릿속 아이디어를 진짜로 만들어드립니다";
// 2026-04-27 Findably 진단 대응: 55자 → 약 80자로 확장 + 타겟 키워드(AI 개발, 프리랜서,
// 비개발자, 창업가) 자연 포함. 검색 결과 SERP 발췌문 충실도 향상.
const APP_DESCRIPTION =
  "AI 개발 프리랜서가 만드는 맞춤 IT 솔루션. 일반 개발사 3개월 → 3주, 1/3 비용. 비개발자 창업가도 OK — Sprint 180만원부터.";
const SITE_URL = "https://dairect.kr";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: "%s | dairect",
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: APP_NAME,
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export const viewport: Viewport = {
  themeColor: "#FFB800",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SchemaJsonLd />
        <SerwistProvider
          swUrl="/sw.js"
          disable={process.env.NODE_ENV === "development"}
          cacheOnNavigation={false}
          reloadOnOnline={false}
        >
          {children}
        </SerwistProvider>
        <Toaster position="top-right" richColors />
        {/* Epic Demo-Dari (2026-04-25): floating chat widget. /dashboard, /portal,
            /login, /signup, /onboarding, /invite, /offline 에서는 자동 숨김. */}
        <DariWidget />
        <Analytics />
      </body>
    </html>
  );
}
