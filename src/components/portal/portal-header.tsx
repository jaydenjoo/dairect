import { Building2, Mail, Sparkles } from "lucide-react";
import {
  projectStatusLabel,
  projectStatusTone,
  type ProjectStatusTone,
} from "@/lib/portal/formatters";

interface Props {
  projectName: string;
  projectStatus: string;
  clientCompanyName: string | null;
  clientContactName: string | null;
  pmCompanyName: string | null;
  pmRepresentativeName: string | null;
  pmBusinessEmail: string | null;
}

const TONE_BADGE: Record<ProjectStatusTone, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-emerald-500/10 text-emerald-700",
  danger: "bg-rose-500/10 text-rose-700",
  muted: "bg-muted text-muted-foreground",
};

const TONE_DOT: Record<ProjectStatusTone, string> = {
  active: "bg-primary animate-pulse",
  completed: "bg-emerald-500",
  danger: "bg-rose-500",
  muted: "bg-muted-foreground/60",
};

export function PortalHeader({
  projectName,
  projectStatus,
  clientCompanyName,
  clientContactName,
  pmCompanyName,
  pmRepresentativeName,
  pmBusinessEmail,
}: Props) {
  const statusLabel = projectStatusLabel(projectStatus);
  const tone = projectStatusTone(projectStatus);

  return (
    <header className="pt-24 pb-12 md:pt-32 md:pb-16">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 font-mono text-xs tracking-wider text-accent-foreground">
            <Sparkles className="h-3 w-3" />
            Client Portal
          </span>

          <div className="flex flex-col gap-3">
            <h1
              className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-foreground"
              style={{ wordBreak: "keep-all" }}
            >
              {projectName}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {clientCompanyName && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {clientCompanyName}
                  {clientContactName && (
                    <span className="text-muted-foreground/80">· {clientContactName}</span>
                  )}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${TONE_BADGE[tone]}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
                {statusLabel}
              </span>
            </div>
          </div>

          {(pmCompanyName || pmRepresentativeName || pmBusinessEmail) && (
            <div className="surface-card inline-flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl px-5 py-3 text-sm shadow-ambient">
              <span className="text-xs font-semibold text-muted-foreground">담당</span>
              {pmCompanyName && (
                <span className="font-medium text-foreground">{pmCompanyName}</span>
              )}
              {pmRepresentativeName && (
                <span className="text-muted-foreground">{pmRepresentativeName}</span>
              )}
              {pmBusinessEmail && (
                <a
                  href={`mailto:${encodeURIComponent(pmBusinessEmail)}`}
                  className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {pmBusinessEmail}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
