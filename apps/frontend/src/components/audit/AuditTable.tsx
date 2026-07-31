import { AuditEntry } from "@/services/audit/types";
import { DataTable } from "@/components/shared/DataTable";
import { format } from "date-fns";
import { Eye } from "lucide-react";

interface AuditTableProps {
  data: AuditEntry[];
  isLoading: boolean;
  onView: (entry: AuditEntry) => void;
}

export function AuditTable({ data, isLoading, onView }: AuditTableProps) {
  const columns = [
    {
      header: "Timestamp",
      accessor: (item: AuditEntry) => (
        <span className="text-slate-600 whitespace-nowrap">
          {format(new Date(item.created_at), "MMM dd, HH:mm:ss")}
        </span>
      ),
    },
    {
      header: "Module",
      accessor: (item: AuditEntry) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 capitalize">
          {item.module}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (item: AuditEntry) => (
        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1 py-0.5 rounded">
          {item.action}
        </span>
      ),
    },
    {
      header: "Entity ID",
      accessor: (item: AuditEntry) => (
        <span className="font-mono text-xs text-slate-500 truncate max-w-[120px] block">
          {item.entity_id}
        </span>
      ),
    },
    {
      header: "Actor",
      accessor: (item: AuditEntry) => (
        <span className="font-mono text-xs text-slate-500 truncate max-w-[120px] block">
          {item.actor_id || "System"}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (item: AuditEntry) => (
        <button
          onClick={() => onView(item)}
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return <DataTable data={data} columns={columns} keyExtractor={(item) => item.id} isLoading={isLoading} />;
}
