"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Activity } from "lucide-react";
import { useAuditSearch } from "@/services/audit/queries";
import { AuditFilter, AuditEntry } from "@/services/audit/types";
import { AuditFilterBar } from "@/components/audit/AuditFilterBar";
import { AuditTable } from "@/components/audit/AuditTable";
import { AuditDrawer } from "@/components/audit/AuditDrawer";

export default function AuditPage() {
  const [filters, setFilters] = useState<AuditFilter>({
    page: 1,
    limit: 20,
    module: "",
    action: "",
    entity_id: "",
  });

  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data, isLoading } = useAuditSearch(filters);

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    // We treat generic search as searching by entity_id
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, entity_id: value, page: 1 }));
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleView = (entry: AuditEntry) => {
    setSelectedEntry(entry);
    setIsDrawerOpen(true);
  };

  const totalPages = data ? Math.ceil(data.total / (filters.limit || 20)) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Audit & Activity Logs" 
        description="Immutable system-wide activity tracking across all domains." 
      />

      <div className="space-y-4">
        <AuditFilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onSearchChange={handleSearchChange} 
        />

        {data?.items && data.items.length === 0 && !isLoading ? (
          <EmptyState 
            icon={Activity} 
            title="No audit logs found" 
            description="Adjust your search filters to find historical records." 
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <AuditTable data={data?.items || []} isLoading={isLoading} onView={handleView} />
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={filters.page || 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <AuditDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        data={selectedEntry} 
      />
    </div>
  );
}
