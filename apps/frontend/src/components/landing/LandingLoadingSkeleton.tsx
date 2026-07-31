export function LandingLoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="pt-24 pb-16 lg:pt-32 lg:pb-24 max-w-7xl mx-auto px-4 text-center">
        <div className="h-6 bg-slate-200 w-32 rounded-full mx-auto mb-6"></div>
        <div className="h-16 bg-slate-200 w-3/4 mx-auto rounded-lg mb-6"></div>
        <div className="h-8 bg-slate-200 w-1/2 mx-auto rounded-lg mb-10"></div>
        <div className="h-6 bg-slate-200 w-2/3 mx-auto rounded-lg mb-10"></div>
        <div className="flex justify-center gap-4">
          <div className="h-12 bg-slate-200 w-48 rounded-full"></div>
          <div className="h-12 bg-slate-200 w-48 rounded-full"></div>
        </div>
      </div>

      {/* Info Skeleton */}
      <div className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-slate-200 w-24 rounded mb-2"></div>
              <div className="h-6 bg-slate-200 w-32 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
