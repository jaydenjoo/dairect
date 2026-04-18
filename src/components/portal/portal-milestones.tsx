import { Check, Circle, Clock } from "lucide-react";
import { formatDate } from "@/lib/portal/formatters";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  completedAt: string | null;
}

interface Props {
  milestones: Milestone[];
  progress: number;
}

export function PortalMilestones({ milestones, progress }: Props) {
  return (
    <section className="pb-12 md:pb-16">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
              마일스톤
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              프로젝트 주요 단계별 진행 상황입니다.
            </p>
          </div>
          <span className="font-mono text-sm font-semibold text-primary">
            {progress}%
          </span>
        </div>

        <div
          className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="프로젝트 진행률"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {milestones.length === 0 ? (
          <div className="surface-card rounded-2xl p-8 text-center shadow-ambient">
            <p className="text-sm text-muted-foreground">
              아직 등록된 마일스톤이 없습니다. 착수 후 단계별 일정이 공유됩니다.
            </p>
          </div>
        ) : (
          <ol className="space-y-3">
            {milestones.map((m) => {
              const Icon = m.isCompleted ? Check : m.dueDate ? Clock : Circle;
              return (
                <li
                  key={m.id}
                  className={[
                    "surface-card flex gap-4 rounded-2xl p-5 shadow-ambient transition-colors",
                    m.isCompleted ? "opacity-80" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
                      m.isCompleted
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-primary/10 text-primary",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={[
                          "font-semibold text-foreground",
                          m.isCompleted ? "line-through decoration-muted-foreground/40" : "",
                        ].join(" ")}
                        style={{ wordBreak: "keep-all" }}
                      >
                        {m.title}
                      </h3>
                      {m.isCompleted && m.completedAt && (
                        <span className="font-mono text-[11px] text-emerald-700">
                          {formatDate(m.completedAt)} 완료
                        </span>
                      )}
                      {!m.isCompleted && m.dueDate && (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          예정 {formatDate(m.dueDate)}
                        </span>
                      )}
                    </div>
                    {m.description && (
                      <p
                        className="mt-1 text-sm text-muted-foreground"
                        style={{ wordBreak: "keep-all" }}
                      >
                        {m.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
