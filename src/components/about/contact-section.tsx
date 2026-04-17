import type { PackageId } from "@/lib/validation/inquiry";
import { ContactForm } from "./contact-form";

interface Props {
  initialPackage?: PackageId;
}

export function ContactSection({ initialPackage }: Props) {
  return (
    <section
      id="contact"
      className="relative overflow-hidden py-24 md:py-32"
      style={{
        background:
          "linear-gradient(180deg, #F5F3FF 0%, #EEF2FF 55%, #F9F9F7 100%)",
      }}
    >
      {/* Ambient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[10%] h-[420px] w-[420px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[5%] h-[360px] w-[360px] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(129,140,248,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        {/* 헤더 */}
        <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-5 text-center md:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-primary">
            CONTACT
          </span>
          <h2
            className="font-heading text-[32px] font-extrabold leading-[1.15] tracking-tight text-foreground md:text-[44px]"
            style={{ letterSpacing: "-0.025em", wordBreak: "keep-all" }}
          >
            내 아이디어, 만들 수 있을까?
          </h2>
          <p
            className="text-base leading-relaxed text-muted-foreground md:text-lg"
            style={{ wordBreak: "keep-all" }}
          >
            편하게 말씀해주세요. 24시간 내 연락드립니다.
          </p>
        </div>

        <ContactForm initialPackage={initialPackage} />
      </div>
    </section>
  );
}
