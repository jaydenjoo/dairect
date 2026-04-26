"use client";

import { track } from "@/lib/analytics";
import { DEFAULT_SLOTS, type Slot } from "@/lib/scheduling-slots";

export function SchedulingStatus({
  slots = DEFAULT_SLOTS,
}: {
  slots?: readonly Slot[];
}) {
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
