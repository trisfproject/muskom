"use client";

import { useEffect, useState } from "react";
import { Search, Download, CheckCircle2, XCircle, Clock } from "lucide-react";
import { adminRegistrationService } from "@/services/registration/admin";
import { AdminRegistrationResponse } from "@/types/registration";

export default function AdminRegistrationsPage() {
  const [data, setData] = useState<AdminRegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminRegistrationService.listRegistrations({
        status: statusFilter,
        participant_name: search,
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to ${status} this registration?`)) return;
    try {
      await adminRegistrationService.updateRegistrationStatus(id, { status });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const exportCSV = () => {
    const headers = ["Registration Code", "Name", "Email", "Phone", "Institution", "Category", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...data.map(r => 
        `"${r.id}","${r.participant_name}","${r.email}","${r.phone || ''}","${r.company || ''}","${r.participant_category}","${r.status}","${new Date(r.created_at).toLocaleDateString()}"`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `registrations_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Peserta</h1>
          <p className="pg-muted text-sm">Kelola pendaftaran peserta musyawarah.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-blue-50 text-primary font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pg-muted" />
            <input 
              type="text" 
              placeholder="Cari nama peserta..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-white"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 pg-muted font-semibold">
              <tr>
                <th className="px-6 py-4">Peserta</th>
                <th className="px-6 py-4">Instansi</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 pg-muted">Memuat data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 pg-muted">Belum ada data pendaftaran.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{row.participant_name}</div>
                      <div className="text-xs pg-muted">{row.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{row.company || '-'}</div>
                      <div className="text-xs pg-muted">{row.job_title}</div>
                    </td>
                    <td className="px-6 py-4">{row.participant_category}</td>
                    <td className="px-6 py-4">
                      {row.status === 'PENDING' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/50"><Clock className="w-3.5 h-3.5"/> Menunggu</span>}
                      {row.status === 'APPROVED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50"><CheckCircle2 className="w-3.5 h-3.5"/> Disetujui</span>}
                      {row.status === 'REJECTED' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200/50"><XCircle className="w-3.5 h-3.5"/> Ditolak</span>}
                    </td>
                    <td className="px-6 py-4 text-xs pg-muted">
                      {new Date(row.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {row.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleStatusUpdate(row.id, "APPROVED")} className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-colors" title="Setujui">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusUpdate(row.id, "REJECTED")} className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Tolak">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
