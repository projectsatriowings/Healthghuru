export default function AdminDashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-28 bg-primary/10 rounded-full" />
        <div className="h-8 w-64 bg-dark/10 rounded-xl" />
        <div className="h-4 w-96 max-w-full bg-text-secondary/10 rounded-lg" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-border flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-24 bg-text-muted/15 rounded-md" />
              <div className="h-8 w-16 bg-dark/15 rounded-lg" />
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10" />
          </div>
        ))}
      </div>

      {/* Main Content Table/Chart Skeleton */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="h-5 w-40 bg-dark/10 rounded-lg" />
          <div className="h-8 w-24 bg-primary/10 rounded-full" />
        </div>
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-surface rounded-xl flex items-center px-4 gap-4">
              <div className="w-8 h-8 rounded-lg bg-border/40" />
              <div className="h-4 w-48 bg-border/60 rounded" />
              <div className="h-4 w-24 ml-auto bg-border/40 rounded" />
              <div className="h-6 w-16 bg-border/50 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
