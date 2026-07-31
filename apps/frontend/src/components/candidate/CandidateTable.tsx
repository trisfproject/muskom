import { CandidateItem } from '@/types/candidate';
import { CandidateStatusBadge } from './CandidateStatusBadge';
import { CandidateActionMenu } from './CandidateActionMenu';
import { CandidateEmptyState } from './CandidateEmptyState';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CandidateTableProps {
  data: CandidateItem[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetail: (id: string) => void;
  onClearFilters: () => void;
}

export function CandidateTable({ data, page, totalPages, onPageChange, onViewDetail, onClearFilters }: CandidateTableProps) {
  if (data.length === 0) {
    return <CandidateEmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4 whitespace-nowrap">Candidate Code</th>
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 whitespace-nowrap">Registration Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {data.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500 text-xs font-semibold">
                  <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{candidate.candidate_code}</span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{candidate.name}</td>
                <td className="px-6 py-4 text-slate-600">{candidate.participant_category}</td>
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                  {new Date(candidate.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <CandidateStatusBadge status={candidate.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  <CandidateActionMenu 
                    candidateId={candidate.id} 
                    status={candidate.status}
                    onViewDetail={onViewDetail}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-sm text-slate-500">
            Page <span className="font-medium text-slate-900">{page}</span> of <span className="font-medium text-slate-900">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button 
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 text-sm rounded-md"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button 
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 text-sm rounded-md"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
