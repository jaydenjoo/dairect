import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PortfolioItemForm } from "../portfolio-item-form";

export const metadata: Metadata = {
  title: "새 포트폴리오",
};

export default function NewPortfolioItemPage() {
  return (
    <div className="py-10">
      <div className="mb-6">
        <Link
          href="/dashboard/portfolio"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          포트폴리오
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          새 포트폴리오
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          /projects 페이지에 노출될 마케팅 자산을 등록합니다.
        </p>
      </div>

      <div className="max-w-2xl rounded-xl border border-border/60 bg-background p-6">
        <PortfolioItemForm
          initial={{
            slug: "",
            name: "",
            nameAmber: "",
            description: "",
            cat: "saas",
            year: "",
            duration: "",
            stack: "",
            statusText: "",
            statusType: "live",
            badge: "",
            metaHint: "",
            liveUrl: "",
            demoUrl: "",
            isPublic: false,
            displayOrder: 0,
          }}
        />
      </div>
    </div>
  );
}
