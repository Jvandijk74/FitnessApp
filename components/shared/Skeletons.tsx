export function StatsCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-surface-elevated bg-surface p-6 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-surface-elevated rounded"></div>
        <div className="h-6 w-6 bg-surface-elevated rounded-full"></div>
      </div>
      <div className="h-8 w-32 bg-surface-elevated rounded mb-1"></div>
      <div className="h-4 w-20 bg-surface-elevated rounded"></div>
    </div>
  );
}

export function TimelineCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-64 rounded-xl border-2 border-surface-elevated bg-surface p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="h-3 w-12 bg-surface-elevated rounded mb-1"></div>
          <div className="h-4 w-20 bg-surface-elevated rounded"></div>
        </div>
        <div className="h-8 w-8 bg-surface-elevated rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-16 bg-surface-elevated rounded-lg"></div>
      </div>
    </div>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-elevated bg-surface p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-elevated"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-surface-elevated rounded"></div>
          <div className="h-3 w-full bg-surface-elevated rounded"></div>
          <div className="h-3 w-5/6 bg-surface-elevated rounded"></div>
        </div>
      </div>
    </div>
  );
}
