export default function PortalLoading() {
  return (
    <div className="pt-24 pb-24 md:pt-32" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <div className="space-y-6">
          <div className="h-6 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-12 w-3/4 animate-pulse rounded-xl bg-muted" />
          <div className="h-5 w-1/3 animate-pulse rounded-full bg-muted" />
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="surface-card h-32 animate-pulse rounded-2xl bg-muted/40 shadow-ambient"
            />
          ))}
        </div>

        <div className="mt-12 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="surface-card h-24 animate-pulse rounded-2xl bg-muted/40 shadow-ambient"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
