export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-4 bg-white/40 dark:bg-slate-900/30">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: cols }).map((__, j) => (
            <div
              key={j}
              className="h-11 flex-1 rounded-xl shimmer-bg bg-slate-200/40 dark:bg-slate-700/40"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-5 shadow-card animate-pulse space-y-3">
      <div className="h-3 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-9 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
