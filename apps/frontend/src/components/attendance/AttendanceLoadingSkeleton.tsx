import { Skeleton } from "@/components/ui/skeleton";

export function AttendanceLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-10 w-16" />
          </div>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
        <Skeleton className="h-10 w-full sm:w-72" />
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex justify-between">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-100 flex justify-between items-center">
            {[...Array(6)].map((_, j) => (
              <Skeleton key={j} className={j === 1 ? "h-6 w-40" : "h-6 w-24"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
