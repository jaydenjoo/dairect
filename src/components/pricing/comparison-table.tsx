import { Check, Minus } from "lucide-react";

type CellValue = true | false | string;

type Row = {
  label: string;
  values: [CellValue, CellValue, CellValue]; // [진단, MVP, 확장]
};

const packageNames = ["진단", "MVP", "확장"] as const;

const rows: Row[] = [
  { label: "아이디어 분석 리포트", values: [true, true, true] },
  { label: "기술 스택 추천", values: [true, true, true] },
  { label: "단계별 로드맵", values: [true, true, true] },
  { label: "MVP 개발 + 배포", values: [false, true, true] },
  { label: "무상 수정 기간", values: ["—", "2주", "2주"] },
  { label: "추가 기능 개발", values: [false, false, "3~5개"] },
  { label: "커스텀 도메인 설정", values: [false, false, true] },
  { label: "관리자 페이지", values: [false, false, true] },
  { label: "운영 모니터링", values: [false, false, true] },
  { label: "운영 가이드북", values: [false, "사용자용", "운영자용"] },
  { label: "사후 이슈 대응", values: ["—", "2주", "2개월"] },
  { label: "소스 코드 이관", values: ["—", "GitHub", "GitHub + 인프라"] },
];

function Cell({ value }: { value: CellValue }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <Minus className="h-4 w-4 text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <span className="block text-center text-sm font-medium text-foreground">
      {value}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="surface-low py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <header className="mb-12 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground/70">
            Compare
          </span>
          <h2
            className="mt-4 font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            style={{ wordBreak: "keep-all" }}
          >
            한눈에 비교하기
          </h2>
        </header>

        <div className="surface-card overflow-hidden rounded-2xl shadow-ambient">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <colgroup>
                <col style={{ width: "32%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>
              <thead>
                <tr className="surface-high">
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 md:px-8"
                  >
                    항목
                  </th>
                  {packageNames.map((name, i) => (
                    <th
                      key={name}
                      scope="col"
                      className={`px-4 py-4 text-center text-sm font-bold ${
                        i === 1
                          ? "bg-primary/[0.08] text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {name}
                      {i === 1 && (
                        <span className="ml-1.5 text-[10px] font-medium text-primary/70">
                          추천
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 === 0 ? "surface-card" : "surface-base"}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 text-left text-sm font-medium text-foreground md:px-8"
                      style={{ wordBreak: "keep-all" }}
                    >
                      {row.label}
                    </th>
                    {row.values.map((v, j) => (
                      <td
                        key={j}
                        className={`px-4 py-4 ${
                          j === 1 ? "bg-primary/[0.06]" : ""
                        }`}
                      >
                        <Cell value={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
