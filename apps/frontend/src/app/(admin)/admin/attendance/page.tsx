"use client";

import { useState } from "react";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { DataToolbar } from "@/components/shared/DataToolbar";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Pagination } from "@/components/shared/Pagination";
import { AttendanceDetailDrawer } from "@/components/attendance/AttendanceDetailDrawer";
import { useAttendanceSearch, useAttendanceSummary } from "@/services/attendance/queries";
import { useCheckIn } from "@/services/attendance/mutations";
import { AttendanceItem, AttendanceFilters } from "@/services/attendance/types";
import { Users, UserCheck, UserX, Percent, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/public-api";

export default function AttendancePage() {
  const [filters, setFilters] = useState<AttendanceFilters>({
    page: 1,
    limit: 10,
    attendance_status: "",
    participant_name: "",
  });

  const [searchValue, setSearchValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<AttendanceItem | null>(null);
  const [drawerData, setDrawerData] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null);

  // We assume there's a way to get the active event. 
  // For RC2, we hardcode an example event ID or leave empty to fetch all.
  const activeEventId = "b91f5309-8d77-4c07-b352-7e045582f3c0";

  const { data: searchData, isLoading: isSearchLoading } = useAttendanceSearch(filters);
  const { data: summaryData, isLoading: isSummaryLoading } = useAttendanceSummary(activeEventId);
  
  const checkInMutation = useCheckIn();

  // Debounced Search Handler
  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, participant_name: val, page: 1 }));
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (id: string, val: string) => {
    setFilters(prev => ({ ...prev, [id]: val, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCheckIn = async (registrationId: string) => {
    setIsCheckingIn(registrationId);
    try {
      await checkInMutation.mutateAsync(registrationId);
      toast.success("Participant checked in successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Check-in failed");
    } finally {
      setIsCheckingIn(null);
    }
  };

  const openDrawer = async (item: AttendanceItem) => {
    try {
      // If they are present, fetch full detail including audit
      if (item.attendance_status === 'PRESENT') {
        const res = await api.get(`/admin/attendance/participant/${item.registration_id}`);
        setDrawerData(res.data);
      } else {
        // Just mock basic data for absent users to show in drawer
        setDrawerData({
          registration_id: item.registration_id,
          full_name: item.participant_name,
          institution: item.institution,
          checked_in_at: new Date().toISOString(),
          email: "Not available",
          id: "", 
        });
      }
      setSelectedItem(item);
      setIsDrawerOpen(true);
    } catch (e) {
      toast.error("Failed to load details");
    }
  };

  const columns = [
    {
      header: "Participant",
      accessor: (item: AttendanceItem) => (
        <div>
          <p className="font-medium text-slate-900">{item.participant_name}</p>
          <p className="text-xs text-slate-500 font-mono">{item.registration_id.split('-')[0]}</p>
        </div>
      ),
    },
    {
      header: "Institution",
      accessor: (item: AttendanceItem) => <span className="text-slate-600">{item.institution}</span>,
    },
    {
      header: "Verification",
      accessor: (item: AttendanceItem) => <StatusBadge status={item.verification_status as any} />,
    },
    {
      header: "Attendance",
      accessor: (item: AttendanceItem) => <StatusBadge status={item.attendance_status as any} />,
    },
    {
      header: "Time",
      accessor: (item: AttendanceItem) => (
        <span className="text-slate-600">
          {item.checked_in_at ? format(new Date(item.checked_in_at), "HH:mm:ss") : "-"}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (item: AttendanceItem) => (
        <div className="flex items-center gap-2">
          {item.attendance_status === 'ABSENT' && item.verification_status === 'APPROVED' ? (
            <button
              onClick={() => handleCheckIn(item.registration_id)}
              disabled={isCheckingIn === item.registration_id}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isCheckingIn === item.registration_id ? 'Loading...' : 'Check In'}
            </button>
          ) : (
            <button
              onClick={() => openDrawer(item)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const totalPages = searchData ? Math.ceil(searchData.total / (filters.limit || 10)) : 0;
  const attendanceRate = summaryData && summaryData.total_participants > 0 
    ? Math.round((summaryData.total_present / summaryData.total_participants) * 100) 
    : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Attendance Management" 
        description="Monitor participant check-ins and real-time attendance stats" 
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {isSummaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-32" />)
        ) : (
          <>
            <SummaryCard title="Registered" value={summaryData?.total_participants || 0} icon={<Users />} />
            <SummaryCard title="Checked In" value={summaryData?.total_present || 0} icon={<UserCheck />} />
            <SummaryCard title="Not Arrived" value={summaryData?.total_absent || 0} icon={<UserX />} />
            <SummaryCard title="Attendance Rate" value={`${attendanceRate}%`} icon={<Percent />} />
          </>
        )}
      </div>

      <div className="space-y-4">
        {/* Toolbar */}
        <DataToolbar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          filters={[
            {
              id: "attendance_status",
              value: filters.attendance_status || "",
              options: [
                { label: "All Status", value: "" },
                { label: "Checked In", value: "PRESENT" },
                { label: "Not Checked In", value: "ABSENT" },
              ]
            }
          ]}
          onFilterChange={handleFilterChange}
        />

        {/* Data Table */}
        <DataTable
          data={searchData?.items || []}
          columns={columns}
          keyExtractor={(item) => item.registration_id}
          isLoading={isSearchLoading}
          emptyState={
            <EmptyState 
              icon={Search} 
              title="No participants found" 
              description="Try adjusting your search or filters to find what you're looking for." 
            />
          }
        />

        {/* Pagination */}
        <Pagination
          currentPage={filters.page || 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <AttendanceDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={drawerData}
      />
    </div>
  );
}
