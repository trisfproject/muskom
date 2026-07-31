import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        <Select
          value={filters.verification_status}
          onValueChange={(value) => onFilterChange("verification_status", value)}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-10 bg-slate-50/50 border-slate-200">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Participants</SelectItem>
            <SelectItem value="APPROVED">Approved Only</SelectItem>
            <SelectItem value="PENDING">Pending Only</SelectItem>
            <SelectItem value="REJECTED">Rejected Only</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.attendance_status}
          onValueChange={(value) => onFilterChange("attendance_status", value)}
        >
          <SelectTrigger className="w-full sm:w-[160px] h-10 bg-slate-50/50 border-slate-200">
            <SelectValue placeholder="Attendance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PRESENT">Checked In</SelectItem>
            <SelectItem value="ABSENT">Not Checked In</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
