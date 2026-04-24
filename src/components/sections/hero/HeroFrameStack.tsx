"use client";

import { motion } from "framer-motion";
import { maskReveal, useReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function HeroFrameStack() {
  const { ref, inView } = useReveal<HTMLDivElement>(0.1);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative min-h-[620px] w-full"
    >
      {/* Frame 1 — Chatsio (bottom, -4deg) */}
      <motion.div
        className={cn(
          "absolute left-0 top-[58%] z-[1] w-[60%]",
          "aspect-[4/3] bg-paper border border-hairline-canvas overflow-hidden",
          "-rotate-[4deg] transition-transform duration-[220ms] ease-[var(--ease-spring-soft)]",
          "hover:translate-x-[-3px] hover:translate-y-[-3px] hover:rotate-0",
        )}
        variants={maskReveal}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={{ delay: 0.52 }}
      >
        <ChatsioArt />
        <FrameCaption id="01" label="CHATSIO · SMB CX" />
      </motion.div>

      {/* Frame 2 — Findably (middle, +2deg) */}
      <motion.div
        className={cn(
          "absolute left-[22%] top-[28%] z-[2] w-[62%]",
          "aspect-[4/3] bg-paper border border-hairline-canvas overflow-hidden",
          "rotate-[2deg] transition-transform duration-[220ms] ease-[var(--ease-spring-soft)]",
          "hover:translate-x-[-3px] hover:translate-y-[-3px] hover:rotate-0",
        )}
        variants={maskReveal}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={{ delay: 0.36 }}
      >
        <FindablyArt />
        <FrameCaption id="02" label="FINDABLY · MKT DIAG" />
      </motion.div>

      {/* Frame 3 — AutoVox (top, -1.5deg) — with amber glow */}
      <motion.div
        className={cn(
          "absolute left-[38%] top-0 z-[3] w-[62%]",
          "aspect-[4/3] bg-paper border border-hairline-canvas overflow-hidden",
          "-rotate-[1.5deg] transition-transform duration-[220ms] ease-[var(--ease-spring-soft)]",
          "hover:translate-x-[-3px] hover:translate-y-[-3px] hover:rotate-0",
          "before:content-[''] before:absolute before:-inset-[18px] before:-z-[1]",
          "before:bg-[radial-gradient(60%_50%_at_50%_70%,rgba(255,184,0,0.42),transparent_70%)]",
          "before:blur-[18px] before:pointer-events-none",
        )}
        variants={maskReveal}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={{ delay: 0.2 }}
      >
        <AutoVoxArt />
        <FrameCaption id="03" label="AUTOVOX · VOICE AUTOMATION" />
      </motion.div>
    </div>
  );
}

function FrameCaption({ id, label }: { id: string; label: string }) {
  return (
    <span className="absolute left-3 -bottom-7 font-mono text-[11px] tracking-[0.1em] uppercase text-dust">
      <span className="text-signal">N°{id}</span> — {label}
    </span>
  );
}

function ArtHead({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-between font-mono text-[10px] tracking-[0.08em] uppercase text-dust">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

function ChatsioArt() {
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-2.5">
      <ArtHead left="N°01 · 2025" right="Chatsio" />
      <div className="mt-2 flex flex-col gap-1.5 font-sans text-[11px]">
        <span className="self-start max-w-[75%] rounded-sm bg-canvas px-2.5 py-1.5 text-ink">
          고객님의 문의를 기다리고 있어요.
        </span>
        <span className="self-end max-w-[75%] rounded-sm bg-ink px-2.5 py-1.5 text-canvas">
          배송은 언제 오나요?
        </span>
        <span className="self-start max-w-[75%] rounded-sm bg-canvas px-2.5 py-1.5 text-ink">
          2~3일 내로 도착합니다.
        </span>
        <span className="self-start rounded-sm bg-canvas px-2.5 py-1.5 text-dust tracking-widest">
          · · ·
        </span>
      </div>
    </div>
  );
}

function FindablyArt() {
  const bars = [28, 44, 62, 36, 78, 54, 88];
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-2.5">
      <ArtHead left="N°02 · 2025" right="Findably" />
      <div className="relative flex-1 flex flex-col justify-end mt-2">
        <div className="font-serif font-medium text-[56px] leading-none text-ink tracking-tight-2">
          82
        </div>
        <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-dust mt-1">
          MKT HEALTH
        </div>
        <div className="flex items-end gap-1 mt-3 h-16">
          {bars.map((h, i) => (
            <span
              key={i}
              className={cn(
                "flex-1",
                [2, 4, 6].includes(i) ? "bg-signal" : "bg-ink/40",
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="h-px bg-hairline-canvas mt-1" />
      </div>
    </div>
  );
}

function AutoVoxArt() {
  const ticks = [30, 52, 84, 40, 70, 26, 92, 48, 62, 78, 34, 22];
  return (
    <div className="absolute inset-0 p-5 flex flex-col gap-2.5">
      <ArtHead left="N°03 · 2025" right="AutoVox" />
      <div className="flex items-center justify-center gap-1 mt-2 h-16">
        {ticks.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-[2px] rounded-sm",
              i % 3 === 2 ? "bg-signal" : "bg-ink",
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-col gap-0.5">
        <span className="font-serif italic text-[13px] text-ink">
          Voice-first automation.
        </span>
        <span className="font-mono text-[9px] tracking-[0.08em] uppercase text-dust">
          VOICE → ACTION · 240 MS
        </span>
      </div>
    </div>
  );
}
