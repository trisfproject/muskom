export function RegistrationLoadingSkeleton() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-3xl mx-auto w-full animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 w-64 rounded-lg mb-2"></div>
        <div className="h-4 bg-slate-200 w-96 rounded"></div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="h-4 bg-slate-200 w-32 rounded mb-2"></div>
          <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-4 bg-slate-200 w-48 rounded mb-2"></div>
            <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
          </div>
          <div>
            <div className="h-4 bg-slate-200 w-32 rounded mb-2"></div>
            <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-4 bg-slate-200 w-32 rounded mb-2"></div>
            <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
          </div>
          <div>
            <div className="h-4 bg-slate-200 w-40 rounded mb-2"></div>
            <div className="h-12 bg-slate-100 w-full rounded-lg"></div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex space-x-3">
            <div className="h-5 w-5 bg-slate-200 rounded"></div>
            <div className="h-4 bg-slate-200 w-3/4 rounded mt-0.5"></div>
          </div>
        </div>

        <div className="pt-4">
          <div className="h-16 bg-slate-200 w-full rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
