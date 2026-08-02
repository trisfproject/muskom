"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: Extract<keyof T, string>;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
  actions?: React.ReactNode; // e.g. "Add User" button
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  loading = false,
  onSearch,
  searchPlaceholder = "Cari data...",
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  actions,
  emptyMessage = "Tidak ada data ditemukan."
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort data locally if no backend sort is provided
  // Note: For full production, sorting should ideally happen in backend if paginated
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-800/50 text-slate-400 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col.key} 
                    className="px-4 py-3 font-medium cursor-pointer hover:text-slate-200 transition-colors group select-none"
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.header}
                      {col.sortable !== false && (
                        <span className="text-slate-600 group-hover:text-slate-400 transition-colors">
                          {sortConfig?.key === col.key ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                // Skeleton Loading
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-slate-900/50">
                    {columns.map((col, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                        {j === 0 && <div className="h-3 bg-slate-800/50 rounded w-1/2 mt-2"></div>}
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                        <Search className="w-6 h-6 text-slate-500" />
                      </div>
                      <p className="text-slate-400 font-medium">{emptyMessage}</p>
                      <p className="text-slate-500 text-xs mt-1">Coba sesuaikan filter pencarian Anda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                sortedData.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-slate-800/30 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 align-top">
                        {col.render ? col.render(row) : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-400 px-1">
          <div>
            Menampilkan <span className="font-medium text-slate-300">{(page - 1) * limit + 1}</span> hingga <span className="font-medium text-slate-300">{Math.min(page * limit, total)}</span> dari <span className="font-medium text-slate-300">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-slate-300 font-medium min-w-[20px] text-center">{page}</span>
              <span className="text-slate-600">/</span>
              <span className="min-w-[20px] text-center">{totalPages}</span>
            </div>
            <button 
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
