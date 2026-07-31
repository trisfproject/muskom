import { AuditFilter } from "@/services/audit/types";
import { DataToolbar } from "@/components/shared/DataToolbar";

interface AuditFilterBarProps {
  filters: AuditFilter;
  onFilterChange: (id: string, value: string) => void;
  onSearchChange: (value: string) => void;
}

export function AuditFilterBar({ filters, onFilterChange, onSearchChange }: AuditFilterBarProps) {
  return (
    <DataToolbar
      searchValue={filters.entity_id || ""}
      searchPlaceholder="Search by Entity ID or Actor ID..."
      onSearchChange={onSearchChange}
      filters={[
        {
          id: "module",
          value: filters.module || "",
          options: [
            { label: "All Modules", value: "" },
            { label: "Attendance", value: "attendance" },
            { label: "Voting", value: "voting" },
            { label: "Participant", value: "participant" },
            { label: "Candidate", value: "candidate" },
            { label: "System", value: "system" },
          ],
        },
        {
          id: "action",
          value: filters.action || "",
          options: [
            { label: "All Actions", value: "" },
            { label: "CREATE", value: "CREATE" },
            { label: "UPDATE", value: "UPDATE" },
            { label: "DELETE", value: "DELETE" },
            { label: "CHECK_IN", value: "CHECK_IN_PARTICIPANT" },
            { label: "UNDO_CHECK_IN", value: "UNDO_CHECK_IN" },
          ],
        },
      ]}
      onFilterChange={onFilterChange}
    />
  );
}
