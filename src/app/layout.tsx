import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import { DariWidget } from "@/components/chrome/DariWidget";
import { Analytics } from "@/components/chrome/Analytics";
import { SerwistProvider } from "./serwist";
import "./globals.css";

const APP_NAME = "Dairect";
const APP_DEFAULT_TITLE = "dairect — 머릿속 아이디어를 진짜로 만들어드립니다";
const APP_DESCRIPTION =
  "개발을 모르셔도, AI를 못 다루셔도 괜찮습니다. 아이디어만 말씀해주세요. 나머지는 저희가 합니다.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: "%s | dairect",
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL("https://dairect.kr"),
  manifest: "/manifest.json",
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
