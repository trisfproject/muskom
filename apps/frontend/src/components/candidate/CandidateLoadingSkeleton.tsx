export function CandidateLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
        <div className="h-10 bg-slate-200 rounded w-32"></div>
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex p-4 border-b border-slate-100 gap-4 items-center">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/5"></div>
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            <div className="h-8 bg-slate-200 rounded w-16 ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
