export function CandidateRegistrationLoadingSkeleton() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto w-full animate-pulse">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <div className="h-8 bg-slate-200 w-64 rounded-lg mb-2"></div>
        <div className="h-4 bg-slate-200 w-96 rounded"></div>
      </div>

      <div className="space-y-10">
        <div className="space-y-6">
          <div className="h-6 bg-slate-200 w-48 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
            </div>
            <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
            <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-6 bg-slate-200 w-40 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 h-40 bg-slate-100 rounded-xl"></div>
            <div className="md:col-span-3 h-40 bg-slate-100 rounded-xl"></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-6 bg-slate-200 w-48 rounded mb-4"></div>
          <div className="h-24 bg-slate-100 w-full rounded-lg"></div>
          <div className="h-24 bg-slate-100 w-full rounded-lg"></div>
        </div>

        <div className="pt-6">
          <div className="h-16 bg-slate-200 w-full rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
