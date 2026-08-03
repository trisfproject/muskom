"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Download, Clock, CheckCircle2, XCircle, AlertCircle, FileEdit, Users, ExternalLink } from "lucide-react";
import { candidateAdminService, CandidateAdminResponse } from "@/services/candidate-admin";
import { useSystemConfig } from "@/contexts/ConfigContext";

export default function AdminCandidatesPage() {
  const { config } = useSystemConfig();
  const [data, setData] = useState<CandidateAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // the active musyawarah ID if needed? For now we just list all, or maybe filter by default active musyawarah
      const res = await candidateAdminService.getCandidates({
        status: statusFilter,
        search: search,
      });
      setData(res);
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

  const exportCSV = () => {
    const headers = ["Registration Number", "Name", "Email", "Phone", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...data.map(r => 
        `"${r.registration_number}","${r.full_name}","${r.email}","${r.phone || ''}","${r.status}","${new Date(r.created_at).toLocaleDateString()}"`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `candidates_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "Draft":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200"><FileEdit className="w-3.5 h-3.5"/> Draft</span>;
      case "Submitted":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/50"><Clock className="w-3.5 h-3.5"/> Submitted</span>;
      case "Under Review":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200/50"><Search className="w-3.5 h-3.5"/> Reviewing</span>;
      case "Revision Required":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200/50"><AlertCircle className="w-3.5 h-3.5"/> Revision Needed</span>;
      case "Verified":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50"><CheckCircle2 className="w-3.5 h-3.5"/> Verified</span>;
      case "Rejected":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200/50"><XCircle className="w-3.5 h-3.5"/> Rejected</span>;
      case "Published":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/50"><Users className="w-3.5 h-3.5"/> Verified & Published</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const PubBadge = ({ pubStatus }: { pubStatus: string }) => {
    switch (pubStatus) {
      case "Published":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50">Published</span>;
      case "Unpublished":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/50">Unpublished</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/50">Hidden</span>;
    }
  };

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verifikasi Bakal Calon</h1>
          <p className="pg-muted text-sm">Review dan verifikasi pendaftaran kandidat.</p>
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
              placeholder="Cari nama atau nomor registrasi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-white min-w-[200px]"
          >
            <option value="">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Revision Required">Revision Required</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 pg-muted font-semibold">
              <tr>
                <th className="px-6 py-4">Registration #</th>
                <th className="px-6 py-4">No. / Urut</th>
                <th className="px-6 py-4">Kandidat</th>
                <th className="px-6 py-4">Verifikasi</th>
                <th className="px-6 py-4">Publikasi</th>
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
                  <td colSpan={6} className="text-center py-8 pg-muted">Belum ada pendaftaran kandidat.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono text-xs">{row.registration_number}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-slate-700">Kandidat: <span className="font-bold">{row.candidate_number || '-'}</span></div>
                      <div className="text-xs pg-muted">Urutan Tampil: {row.display_order}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{row.full_name}</div>
                      <div className="text-xs pg-muted">{row.email} • {row.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PubBadge pubStatus={row.publication_status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/candidates/${row.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-primary hover:text-primary rounded-lg text-xs font-medium transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Buka Profil
                      </Link>
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
