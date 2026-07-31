'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData, useQueries } from '@tanstack/react-query';
import { candidateService } from '@/services/candidate';
import { CandidateTable } from '@/components/candidate/CandidateTable';
import { CandidateToolbar } from '@/components/candidate/CandidateToolbar';
import { CandidateDetailDrawer } from '@/components/candidate/CandidateDetailDrawer';
import { CandidateLoadingSkeleton } from '@/components/candidate/CandidateLoadingSkeleton';
import { ManualCandidateDialog } from '@/components/candidate/ManualCandidateDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function CandidatesPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const limit = 10;

  // Main table data query
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['candidates', { page, limit, searchTerm, statusFilter }],
    queryFn: () => candidateService.getCandidates({
      page,
      limit,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
    }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000 * 2, // 2 minutes
  });

  // Parallel queries to construct the summary metrics
  const summaryQueries = useQueries({
    queries: [
      {
        queryKey: ['candidate-summary-total'],
        queryFn: () => candidateService.getCandidates({ limit: 1 }),
        staleTime: 60 * 1000 * 5,
      },
      {
        queryKey: ['candidate-summary-pending'],
        queryFn: () => candidateService.getSummary(),
        staleTime: 60 * 1000 * 5,
      },
      {
        queryKey: ['candidate-summary-approved'],
        queryFn: () => candidateService.getCandidates({ limit: 1, status: 'ACCEPTED' }),
        staleTime: 60 * 1000 * 5,
      },
      {
        queryKey: ['candidate-summary-rejected'],
        queryFn: () => candidateService.getCandidates({ limit: 1, status: 'REJECTED' }),
        staleTime: 60 * 1000 * 5,
      }
    ]
  });

  const totalCandidates = summaryQueries[0].data?.total || 0;
  const pendingCandidates = summaryQueries[1].data?.pending_candidates || 0;
  const approvedCandidates = summaryQueries[2].data?.total || 0;
  const rejectedCandidates = summaryQueries[3].data?.total || 0;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate Verification</h1>
          <p className="text-slate-500 mt-1 text-sm">Review candidate profiles, documents, and approve eligibility.</p>
        </div>
        <ManualCandidateDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Candidates</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalCandidates}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Clock className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <h3 className="text-2xl font-bold text-slate-900">{pendingCandidates}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-green-600"><CheckCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Approved</p>
              <h3 className="text-2xl font-bold text-slate-900">{approvedCandidates}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg text-red-600"><XCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Rejected</p>
              <h3 className="text-2xl font-bold text-slate-900">{rejectedCandidates}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <CandidateToolbar 
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onRefresh={refetch}
        isRefetching={isFetching}
        currentStatus={statusFilter}
      />

      {isError && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center">
          <p className="font-medium text-sm">Failed to load candidates. Please try refreshing.</p>
        </div>
      )}

      {isLoading ? (
        <CandidateLoadingSkeleton />
      ) : (
        <CandidateTable 
          data={data?.data || []}
          page={page}
          totalPages={data?.total_pages || 1}
          onPageChange={setPage}
          onViewDetail={(id) => setSelectedCandidateId(id)}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Slide-out Drawer */}
      <CandidateDetailDrawer 
        candidateId={selectedCandidateId}
        onClose={() => setSelectedCandidateId(null)}
      />
    </div>
  );
}
