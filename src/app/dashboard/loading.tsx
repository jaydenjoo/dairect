export default function DashboardLoading() {
  return (
    <div className="py-10" aria-busy="true" aria-live="polite">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-card shadow-ambient"
          />
        ))}
      </div>

      <div className="mt-8 h-40 animate-pulse rounded-2xl bg-card shadow-ambient" />

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-card shadow-ambient" />
        <div className="h-72 animate-pulse rounded-2xl bg-card shadow-ambient" />
      </div>

      <div className="mt-8 h-56 animate-pulse rounded-2xl bg-card shadow-ambient" />
    </div>
  );
}
