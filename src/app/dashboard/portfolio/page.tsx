import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listPortfolioItemsForDashboard } from "./queries";
import { LayoutGrid, Plus, Eye, EyeOff, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "포트폴리오",
};

const CAT_LABELS: Record<string, string> = {
  saas: "SaaS",
  automation: "Automation",
  editorial: "Editorial",
  tools: "Tools",
};

export default async function PortfolioPage() {
  const items = await listPortfolioItemsForDashboard();
  const publicCount = items.filter((i) => i.isPublic).length;

  return (
    <div className="py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            포트폴리오
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length}개 등록 · {publicCount}개 공개 ·{" "}
            <Link href="/projects" className="underline-offset-2 hover:underline">
              /projects 페이지에 노출
            </Link>
          </p>
        </div>
        <Link href="/dashboard/portfolio/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />새 포트폴리오
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 p-12 text-center">
          <LayoutGrid className="h-10 w-10 text-muted-foreground/60" />
          <p className="mt-4 text-sm font-medium text-foreground">
            아직 등록된 포트폴리오가 없습니다
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            &quot;+ 새 포트폴리오&quot; 버튼으로 첫 항목을 등록하세요. 0개일 때는 fallback 정적 10개가 노출됩니다.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-border/60 bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">순서</th>
                <th className="px-4 py-3 text-left">이름</th>
                <th className="px-4 py-3 text-left">카테고리</th>
                <th className="px-4 py-3 text-left">상태</th>
                <th className="px-4 py-3 text-left">Live / Demo</th>
                <th className="px-4 py-3 text-left">공개</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {String(it.displayOrder).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/portfolio/${it.id}`}
                      className="font-medium hover:underline"
                    >
                      {it.name}
                      {it.nameAmber && (
                        <span className="text-[#FFB800]">{it.nameAmber}</span>
                      )}
                    </Link>
                    {it.slug && (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        /{it.slug}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {CAT_LABELS[it.cat] ?? it.cat}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {it.statusText ? (
                      <span
                        className={
                          it.statusType === "live"
                            ? "text-green-700"
                            : "text-[#8B8680]"
                        }
                      >
                        {it.statusText}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-xs">
                      {it.liveUrl && (
                        <a
                          href={it.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                        >
                          Live <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {it.demoUrl && (
                        <a
                          href={it.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#FFB800] hover:underline"
                        >
                          Demo <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {!it.liveUrl && !it.demoUrl && (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {it.isPublic ? (
                      <Badge className="border-0 bg-[rgba(255,184,0,0.16)] text-[#141414]">
                        <Eye className="mr-1 h-3 w-3" />
                        공개
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <EyeOff className="mr-1 h-3 w-3" />
                        비공개
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/portfolio/${it.id}`}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                      편집 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {publicCount > 10 && (
        <p className="mt-4 text-xs text-amber-700">
          ⚠️ 공개 항목이 10개를 초과했습니다. /projects 에는 정렬 순서 낮은 10개만 노출됩니다.
        </p>
      )}
    </div>
  );
}
