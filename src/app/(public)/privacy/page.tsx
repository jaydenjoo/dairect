import type { Metadata } from "next";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: "개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav solidAlways />
      <main
        id="main"
        className="relative z-[2] min-h-screen bg-canvas px-6 pt-32 pb-24"
      >
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-dust">
            — §02 / Privacy Policy
          </p>
          <h1 className="mt-6 font-serif text-4xl font-light tracking-[-0.02em] text-ink md:text-5xl">
            개인정보처리방침<span className="text-signal">.</span>
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-dust">
            최종 수정일: 2026.04.16
          </p>
          <div
            className="mt-12 bg-paper p-12 text-center font-mono text-sm text-dust"
            style={{
              border: "1px solid var(--hairline-canvas)",
              boxShadow: "4px 4px 0 var(--ink)",
            }}
          >
            개인정보처리방침은 Phase 1 완료 후 추가 예정입니다
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
