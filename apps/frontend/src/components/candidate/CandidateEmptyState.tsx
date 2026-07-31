import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CandidateEmptyStateProps {
  onClearFilters?: () => void;
}

export function CandidateEmptyState({ onClearFilters }: CandidateEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-center">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <FileQuestion className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">No Candidates Found</h3>
      <p className="text-slate-500 max-w-sm mb-6 text-sm">
        We couldn&apos;t find any candidates matching your current search or filter criteria.
      </p>
      {onClearFilters && (
        <Button onClick={onClearFilters} className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100">
          Clear Filters
        </Button>
      )}
    </div>
  );
}
