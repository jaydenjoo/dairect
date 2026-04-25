import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PortfolioItemForm } from "../portfolio-item-form";
import { getPortfolioItem } from "../queries";
import type {
  PortfolioCategory,
  PortfolioStatusType,
} from "@/lib/validation/portfolio-item";

export const metadata: Metadata = {
  title: "포트폴리오 편집",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPortfolioItemPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getPortfolioItem(id);
  if (!item) notFound();

  return (
    <div className="py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/portfolio"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            포트폴리오
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
            {item.name}
            {item.nameAmber && (
              <span className="text-[#FFB800]">{item.nameAmber}</span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.isPublic ? "공개 중 — /projects 에 노출됩니다" : "비공개 (저장 후 토글로 공개)"}
          </p>
        </div>
        {item.isPublic && (
          <Link
            href="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            공개 페이지 열기 <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="max-w-2xl rounded-xl border border-border/60 bg-background p-6">
        <PortfolioItemForm
          initial={{
            id: item.id,
            slug: item.slug,
            name: item.name,
            nameAmber: item.nameAmber,
            description: item.description,
            cat: (item.cat ?? "saas") as PortfolioCategory,
            year: item.year,
            duration: item.duration,
            stack: item.stack,
            statusText: item.statusText,
            statusType: (item.statusType ?? "live") as PortfolioStatusType,
            badge: item.badge,
            metaHint: item.metaHint,
            liveUrl: item.liveUrl,
            demoUrl: item.demoUrl,
            isPublic: item.isPublic,
            displayOrder: item.displayOrder,
          }}
        />
      </div>
    </div>
  );
}
