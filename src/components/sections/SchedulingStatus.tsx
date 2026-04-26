"use client";

import { track } from "@/lib/analytics";

type SlotStatus = "available" | "next-week" | "waiting";

type Slot = {
  pkg: string;
  status: SlotStatus;
  copy: string;
};

const slots: readonly Slot[] = [
  {
    pkg: "Sprint",
    status: "available",
    copy: "1자리 가능 — 24시간 안에 회신",
  },
  {
    pkg: "Build",
    status: "available",
    copy: "2자리 가능 — 다음 주 시작",
  },
  {
    pkg: "Scale",
    status: "waiting",
    copy: "2주 대기 — 화이트리스트 적합도 먼저 회신",
  },
];

export function SchedulingStatus() {
  return (
    <div className="scheduling-status reveal-fade" data-reveal>
      <div className="ss-head">
        <span className="ss-dot" aria-hidden="true" />
        <span className="ss-label">REAL-TIME SCHEDULING</span>
      </div>
      <p className="ss-sub">이번 주 의뢰 가능 슬롯 (자동 동기화)</p>

      <ul className="ss-list">
        {slots.map((s) => (
          <li
            key={s.pkg}
            className="ss-row"
            data-status={s.status}
            onClick={() => track("schedule_click", s.pkg.toLowerCase())}
            style={{ cursor: "pointer" }}
          >
            <span className="ss-pkg">{s.pkg}</span>
            <span className="ss-copy">{s.copy}</span>
          </li>
        ))}
      </ul>

      <p className="ss-foot">* 자체 발주·일정관리 시스템과 자동 연동</p>
    </div>
  );
}
