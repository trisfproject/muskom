'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData, useQueries } from '@tanstack/react-query';
import { participantService } from '@/services/participant';
import { ParticipantTable } from '@/components/participants/ParticipantTable';
import { ParticipantToolbar } from '@/components/participants/ParticipantToolbar';
import { ParticipantDetailDrawer } from '@/components/participants/ParticipantDetailDrawer';
import { ParticipantLoadingSkeleton } from '@/components/participants/ParticipantLoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

export default function ParticipantsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const limit = 10;

  // Main table data query
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['participants', { page, limit, searchTerm, statusFilter }],
    queryFn: () => participantService.getParticipants({
      page,
      limit,
      participant_name: searchTerm || undefined,
      status: statusFilter || undefined,
    }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000 * 2, // 2 minutes
  });

  // Parallel queries to construct the summary metrics since backend lacks a full summary endpoint for all statuses
  const summaryQueries = useQueries({
    queries: [
      {
        queryKey: ['participant-summary-total'],
        queryFn: () => participantService.getParticipants({ limit: 1 }),
        staleTime: 60 * 1000 * 5,
      },
      {
        queryKey: ['participant-summary-pending'],
        queryFn: () => participantService.getVerificationSummary(),
        staleTime: 60 * 1000 * 5,
      },
      {
        queryKey: ['participant-summary-approved'],
        queryFn: () => participantService.getParticipants({ limit: 1, status: 'APPROVED' }),
        staleTime: 60 * 1000 * 5,
      },
      {
        queryKey: ['participant-summary-rejected'],
        queryFn: () => participantService.getParticipants({ limit: 1, status: 'REJECTED' }),
        staleTime: 60 * 1000 * 5,
      }
    ]
  });

  const totalParticipants = summaryQueries[0].data?.total || 0;
  const pendingParticipants = summaryQueries[1].data?.pending_participants || 0;
  const approvedParticipants = summaryQueries[2].data?.total || 0;
  const rejectedParticipants = summaryQueries[3].data?.total || 0;

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Participant Verification</h1>
        <p className="text-slate-500 mt-1 text-sm">Review, approve, and manage participant registrations.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Participants</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalParticipants}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg text-yellow-600"><Clock className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <h3 className="text-2xl font-bold text-slate-900">{pendingParticipants}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-green-600"><UserCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Approved</p>
              <h3 className="text-2xl font-bold text-slate-900">{approvedParticipants}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg text-red-600"><UserX className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Rejected</p>
              <h3 className="text-2xl font-bold text-slate-900">{rejectedParticipants}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <ParticipantToolbar 
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onRefresh={refetch}
        isRefetching={isFetching}
        currentStatus={statusFilter}
      />

      {isError && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center">
          <p className="font-medium text-sm">Failed to load participants. Please try refreshing.</p>
        </div>
      )}

      {isLoading ? (
        <ParticipantLoadingSkeleton />
      ) : (
        <ParticipantTable 
          data={data?.data || []}
          page={page}
          totalPages={data?.total_pages || 1}
          onPageChange={setPage}
          onViewDetail={(id) => setSelectedParticipantId(id)}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Slide-out Drawer */}
      <ParticipantDetailDrawer 
        participantId={selectedParticipantId}
        onClose={() => setSelectedParticipantId(null)}
      />
    </div>
  );
}
