
export function AttendanceLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="h-4 w-24 mb-4 bg-slate-200 animate-pulse rounded" />
            <div className="h-10 w-16 bg-slate-200 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
        <div className="h-10 w-full sm:w-72 bg-slate-200 animate-pulse rounded" />
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded" />
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex justify-between">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 w-20 bg-slate-200 animate-pulse rounded" />
            ))}
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-100 flex justify-between items-center">
            {[...Array(6)].map((_, j) => (
              <div key={j} className={`${j === 1 ? "h-6 w-40" : "h-6 w-24"} bg-slate-200 animate-pulse rounded`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
