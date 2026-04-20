export default function ProjectDetailLoading() {
  return (
    <div className="py-10" aria-busy="true" aria-live="polite">
      <div className="h-4 w-32 animate-pulse rounded-md bg-muted/60" />

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted/60" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-card shadow-ambient"
          />
        ))}
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 flex-shrink-0 animate-pulse rounded-lg bg-muted/60"
          />
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div className="h-40 animate-pulse rounded-2xl bg-card shadow-ambient" />
        <div className="h-56 animate-pulse rounded-2xl bg-card shadow-ambient" />
      </div>
    </div>
  );
}
