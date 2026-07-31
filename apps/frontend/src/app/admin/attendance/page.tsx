'use client';

import { useState } from 'react';
import { useAttendances } from '@/services/attendance/queries';
import { useQuery } from '@tanstack/react-query';
import { landingService } from '@/services/landing';
import { AttendanceSummary } from '@/components/attendance/AttendanceSummary';
import { AttendanceToolbar } from '@/components/attendance/AttendanceToolbar';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import { AttendanceDrawer } from '@/components/attendance/AttendanceDrawer';
import { AttendanceLoadingSkeleton } from '@/components/attendance/AttendanceLoadingSkeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AttendancePage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    participant_name: '',
    attendance_status: 'ALL',
    verification_status: 'ALL',
  });
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);

  const { data: event } = useQuery({
    queryKey: ['admin-active-event'],
    queryFn: landingService.getPublicEvent,
    staleTime: 60 * 1000 * 5,
  });

  // Transform 'ALL' to undefined for backend
  const activeFilters = {
    participant_name: filters.participant_name || undefined,
    attendance_status: filters.attendance_status !== 'ALL' ? filters.attendance_status : undefined,
    verification_status: filters.verification_status !== 'ALL' ? filters.verification_status : undefined,
    page,
    limit: 10,
    sort_by: 'created_at',
    sort_direction: 'desc' as const,
  };

  const { data, isLoading, isError, refetch } = useAttendances(activeFilters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset page on filter
  };

  const totalPages = data?.total ? Math.ceil(data.total / 10) : 1;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance Management</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              {event?.name || 'Loading active event...'} 
              {event?.status && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider ml-2 border border-slate-200">
                  {event.status.replace('_', ' ')}
                </span>
              )}
            </p>
          </div>
        </div>

        <AttendanceSummary />

        {isLoading && page === 1 ? (
          <AttendanceLoadingSkeleton />
        ) : isError ? (
          <div className="bg-red-50 text-red-600 p-8 text-center rounded-xl border border-red-100">
            <h3 className="text-lg font-semibold mb-2">Failed to load attendance records</h3>
            <Button onClick={() => refetch()} className="mt-2 bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-100">
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AttendanceToolbar 
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            <AttendanceTable 
              data={data?.items || []}
              onViewDetail={setSelectedRegistrationId}
            />

            {/* Pagination Controls */}
            {data?.items && data.items.length > 0 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-sm">
                <div className="text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-900">{((page - 1) * 10) + 1}</span> to <span className="font-medium text-slate-900">{Math.min(page * 10, data.total)}</span> of <span className="font-medium text-slate-900">{data.total}</span> participants
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    className="h-8 w-8 p-0 bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-100"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium text-slate-700 px-2">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    className="h-8 w-8 p-0 bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-100"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <AttendanceDrawer 
          registrationId={selectedRegistrationId}
          isOpen={!!selectedRegistrationId}
          onClose={() => setSelectedRegistrationId(null)}
        />
      </div>
    </AdminLayout>
  );
}
