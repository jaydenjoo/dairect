export default function ProjectsLoading() {
  return (
    <div className="py-10" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded-md bg-muted/60" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="mt-6 flex gap-2">
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-muted/60" />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl bg-card shadow-ambient">
        <div className="h-12 animate-pulse bg-muted/40" />
        <div className="divide-y divide-border/20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-card" />
          ))}
        </div>
      </div>
    </div>
  );
}
