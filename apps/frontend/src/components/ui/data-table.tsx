"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

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
  actions?: React.ReactNode;
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
  emptyMessage = "Tidak ada data ditemukan.",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (onSearch) onSearch(term);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pg-muted pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pg-text placeholder:pg-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        {/* Extra actions (e.g. "Add" button) */}
        {actions && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>

      {/* ── Table card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            {/* Header */}
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider pg-muted cursor-pointer select-none hover:pg-text transition-colors group"
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable !== false && (
                        <span className="pg-muted group-hover:pg-text transition-colors">
                          {sortConfig?.key === col.key ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 pg-text">
              {loading ? (
                // Skeleton rows
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((col, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                        {j === 0 && (
                          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2 mt-2" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Search className="w-5 h-5 pg-muted" />
                      </div>
                      <p className="text-sm font-semibold pg-muted">{emptyMessage}</p>
                      <p className="text-xs pg-muted opacity-70">Coba sesuaikan kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((row, i) => (
                  <tr
                    key={row.id || i}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3.5 align-middle">
                        {col.render ? col.render(row) : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        {!loading && total > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-between text-xs pg-muted">
            <span>
              Menampilkan{" "}
              <span className="font-semibold pg-text">{(page - 1) * limit + 1}</span>
              {" "}–{" "}
              <span className="font-semibold pg-text">{Math.min(page * limit, total)}</span>
              {" "}dari{" "}
              <span className="font-semibold pg-text">{total}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange && onPageChange(page - 1)}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium pg-text">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => onPageChange && onPageChange(page + 1)}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
