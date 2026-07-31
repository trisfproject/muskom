import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface AttendanceToolbarProps {
  onFilterChange: (key: string, value: string) => void;
  filters: {
    participant_name: string;
    attendance_status: string;
    verification_status: string;
  };
}

export function AttendanceToolbar({ onFilterChange, filters }: AttendanceToolbarProps) {
  const [searchTerm, setSearchTerm] = useState(filters.participant_name || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    onFilterChange("participant_name", debouncedSearchTerm);
  }, [debouncedSearchTerm, onFilterChange]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search participant name, company..."
          className="pl-9 h-10 w-full bg-slate-50/50 border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex gap-3 w-full sm:w-auto">
        <select
          value={filters.verification_status}
          onChange={(e) => onFilterChange("verification_status", e.target.value)}
          className="w-full sm:w-[160px] h-10 px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Verification</option>
          <option value="APPROVED">Approved Only</option>
          <option value="PENDING">Pending Only</option>
          <option value="REJECTED">Rejected Only</option>
        </select>

        <select
          value={filters.attendance_status}
          onChange={(e) => onFilterChange("attendance_status", e.target.value)}
          className="w-full sm:w-[160px] h-10 px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Status</option>
          <option value="PRESENT">Checked In</option>
          <option value="ABSENT">Not Checked In</option>
        </select>
      </div>
    </div>
  );
}
