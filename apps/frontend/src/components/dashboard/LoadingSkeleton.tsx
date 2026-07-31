import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 bg-slate-200 rounded-lg w-full"></div>
      
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 rounded w-1/4 mt-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3 mt-3"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6">
        <div className="h-64 bg-slate-200 rounded-lg w-full"></div>
        <div className="h-64 bg-slate-200 rounded-lg w-full"></div>
      </div>
    </div>
  );
}
