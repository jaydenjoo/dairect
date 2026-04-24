import Link from "next/link";
import { Button } from "@/components/primitives/Button";
import { Kicker } from "@/components/primitives/Kicker";
import { Reveal } from "@/components/motion/Reveal";
import { HeroHeadline } from "./HeroHeadline";
import { HeroFrameStack } from "./HeroFrameStack";
import { HeroTrustRow } from "./HeroTrustRow";

export function Hero() {
  return (
    <section
      id="hero"
      data-screen-label="01 Hero"
      className="relative pt-[120px] pb-40 px-6 md:px-12"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-6 flex flex-col gap-10 min-w-0">
            <Reveal>
              <Kicker>
                — A STUDIO <em className="font-serif italic text-signal font-medium">directed</em>{" "}
                BY HUMAN,{" "}
                <em className="font-serif italic text-signal font-medium">executed</em> BY AI
              </Kicker>
            </Reveal>

            <Reveal delay={0.08}>
              <p
                aria-hidden="true"
                className="font-mono text-[11px] tracking-[0.12em] uppercase text-dust -mt-6"
              >
                <span>D</span>
                <span className="text-dust/60"> . </span>
                <span className="text-signal">AI</span>
                <span className="text-dust/60"> . </span>
                <span>RECT</span>
                <span className="mx-3">&mdash;</span>
                <span>
                  DIRECTOR OF <span className="text-signal">AI</span>, WORKING DIRECT
                </span>
              </p>
            </Reveal>

            <HeroHeadline />

            <Reveal delay={0.18}>
              <p className="font-serif italic font-light text-[clamp(18px,1.4vw,22px)] leading-[1.5] text-ink/75 m-0">
                Human <em className="text-signal font-serif italic">directs.</em>{" "}
                <span className="font-medium">
                  Machine{" "}
                  <code className="text-signal font-mono not-italic">executes.</code>
                </span>
                <br />
                And the page looks <em className="text-signal font-serif italic">like both.</em>
              </p>
            </Reveal>

            <Reveal delay={0.32}>
              <p className="font-ko font-normal text-[17px] leading-[1.75] text-ink/80 m-0 max-w-[34em]">
                코드는 AI가 씁니다.{" "}
                <em className="not-italic font-medium text-ink">방향은 저희가 잡습니다.</em>{" "}
                비개발자 창업가와 중소기업의 아이디어가 실제로 작동하는 제품이 될 때까지, 2~3주
                안에.
              </p>
            </Reveal>

            <Reveal delay={0.44}>
              <div className="flex items-center gap-6 flex-wrap">
                <Button variant="primary" href="/about#contact">
                  프로젝트 시작하기 <span aria-hidden="true">→</span>
                </Button>
                <Link
                  href="/projects"
                  className="font-sans text-[15px] text-ink/70 hover:text-ink transition-colors duration-[180ms]"
                >
                  포트폴리오 보기 →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.6}>
              <HeroTrustRow />
            </Reveal>
          </div>

          <div className="md:col-span-6 relative">
            <HeroFrameStack />
          </div>
        </div>
      </div>
    </section>
  );
}
