import { cn } from "@/lib/utils";

type TrustItem = {
  labelEn: string;
  labelKo: string;
  value: string;
  valueSuffix?: string;
  signalDot?: boolean;
};

const items: TrustItem[] = [
  { labelEn: "N°", labelKo: "완료 프로젝트", value: "12", valueSuffix: "건" },
  { labelEn: "AVG", labelKo: "평균 기간", value: "2.1", valueSuffix: "주", signalDot: true },
  { labelEn: "CSAT", labelKo: "고객 만족도", value: "98", valueSuffix: "%" },
];

export function HeroTrustRow() {
  return (
    <div
      className={cn(
        "mt-6 pt-8 border-t border-hairline-canvas",
        "flex flex-wrap gap-12",
      )}
    >
      {items.map((item) => (
        <div key={item.labelKo} className="flex flex-col gap-2">
          <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-dust">
            {item.labelEn}
            <span className="normal-case tracking-normal font-ko ml-1">
              {item.labelKo}
            </span>
          </span>
          <span
            className={cn(
              "font-serif font-medium text-[36px] leading-none text-ink tracking-tight-2",
              "[font-variant-numeric:tabular-nums]",
            )}
          >
            {item.signalDot ? (
              <>
                {item.value.split(".")[0]}
                <span className="text-signal">.</span>
                {item.value.split(".")[1]}
              </>
            ) : (
              item.value
            )}
            {item.valueSuffix && (
              <span className="text-[0.5em] text-dust font-normal ml-1">
                {item.valueSuffix}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
