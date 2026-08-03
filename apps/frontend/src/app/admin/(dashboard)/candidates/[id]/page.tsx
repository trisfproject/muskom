"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, FileText, CheckCircle2, XCircle, AlertCircle, Eye, RefreshCw, Calendar, MapPin, Briefcase } from "lucide-react";
import { candidateAdminService, CandidateAdminResponse, CandidateAdminDocumentResponse } from "@/services/candidate-admin";
import api from "@/lib/api";

export default function CandidateDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [candidate, setCandidate] = useState<CandidateAdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<any[]>([]);

  // Verification actions state
  const [verifyStatus, setVerifyStatus] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Document modal state
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [docNotes, setDocNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await candidateAdminService.getCandidateDetail(id);
      setCandidate(res);
      setVerifyStatus(res.status);
      setVerifyNotes(res.verification_notes || "");

      // Fetch audit logs manually since we don't have a specific client mapped easily
      const auditRes = await api.get<{ data: { items: any[] } }>(`/admin/audit?entity_id=${id}`);
      if (auditRes.data?.data?.items) {
        setAudits(auditRes.data.data.items);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load candidate details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerifyCandidate = async () => {
    if (!verifyStatus) return alert("Select a status");
    setVerifying(true);
    try {
      await candidateAdminService.verifyCandidate(id, verifyStatus, verifyNotes);
      alert("Verification status updated");
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyDocument = async (docId: string, status: "Valid" | "Invalid") => {
    try {
      await candidateAdminService.verifyDocument(id, docId, status, docNotes);
      alert(`Document marked as ${status}`);
      setSelectedDoc(null);
      setDocNotes("");
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to verify document");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Memuat data kandidat...</div>;
  }

  if (!candidate) {
    return <div className="p-8 text-center text-red-500">Kandidat tidak ditemukan</div>;
  }

  return (
    <main className="p-6 pb-20">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Candidate Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                {candidate.profile_photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={candidate.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{candidate.full_name}</h1>
                <p className="text-slate-500">{candidate.registration_number}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-slate-400" /> {candidate.occupation || '-'} di {candidate.organization || '-'}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {candidate.birth_place || '-'}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {candidate.birth_date ? new Date(candidate.birth_date).toLocaleDateString('id-ID') : '-'}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                <p className="font-medium text-slate-900">{candidate.email}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Telepon</label>
                <p className="font-medium text-slate-900">{candidate.phone}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat</label>
                <p className="font-medium text-slate-900 whitespace-pre-wrap">{candidate.address || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Profil & Visi Misi</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Biografi Singkat</h3>
                <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {candidate.biography || 'Belum diisi'}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Motivasi</h3>
                <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {candidate.motivation || 'Belum diisi'}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Visi</h3>
                <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {candidate.vision || 'Belum diisi'}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Misi</h3>
                <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {candidate.mission || 'Belum diisi'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Dokumen Pendaftaran</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidate.documents?.length === 0 && <p className="text-sm text-slate-500">Tidak ada dokumen.</p>}
              {candidate.documents?.map((doc: CandidateAdminDocumentResponse) => (
                <div key={doc.id} className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-sm text-slate-900">{doc.document_type}</h4>
                      {doc.verification_status === 'Valid' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {doc.verification_status === 'Invalid' && <XCircle className="w-4 h-4 text-red-500" />}
                      {!doc.verification_status || doc.verification_status === 'Pending' ? <AlertCircle className="w-4 h-4 text-amber-500" /> : null}
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1" title={doc.original_filename}>{doc.original_filename}</p>
                    <p className="text-[10px] text-slate-400">{(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    
                    {doc.verification_notes && (
                      <div className="mt-2 text-xs bg-red-50 text-red-700 p-2 rounded">
                        <strong>Catatan:</strong> {doc.verification_notes}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setDocNotes(doc.verification_notes || "");
                    }}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded transition-colors border border-slate-200"
                  >
                    <Eye className="w-4 h-4" /> Review Dokumen
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Actions & Audit */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Status Verifikasi</h2>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status</label>
              <select
                value={verifyStatus}
                onChange={(e) => setVerifyStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
              >
                <option value="Draft">Draft (Only candidate can submit)</option>
                <option value="Submitted">Submitted (Waiting Review)</option>
                <option value="Under Review">Under Review</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Internal / Revisi</label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Tulis alasan penolakan, catatan internal, atau catatan revisi untuk kandidat..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary min-h-[100px]"
              />
              <p className="text-[10px] text-slate-500 mt-1">Jika status diubah ke 'Revision Required', catatan ini akan ditampilkan kepada kandidat.</p>
            </div>

            <button
              onClick={handleVerifyCandidate}
              disabled={verifying}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Simpan Perubahan
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Riwayat Audit</h2>
            <div className="space-y-4">
              {audits.length === 0 && <p className="text-xs text-slate-500">Belum ada riwayat aktivitas.</p>}
              {audits.map(audit => (
                <div key={audit.id} className="relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute w-2 h-2 bg-slate-300 rounded-full -left-[5px] top-1.5 border-2 border-white"></div>
                  <p className="text-xs font-bold text-slate-700">{audit.action}</p>
                  <p className="text-[10px] text-slate-500">{new Date(audit.created_at).toLocaleString('id-ID')}</p>
                  {audit.new_value?.status && (
                    <p className="text-xs mt-1 bg-slate-50 p-1.5 rounded text-slate-600">
                      Status ➔ <span className="font-semibold">{audit.new_value.status}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Document Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900">{selectedDoc.document_type}</h3>
                <p className="text-xs text-slate-500">{selectedDoc.original_filename}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden bg-slate-100 flex items-center justify-center relative min-h-[400px]">
              {selectedDoc.mime_type.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={candidateAdminService.getDocumentStreamUrl(candidate.id, selectedDoc.id)} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedDoc.mime_type === 'application/pdf' ? (
                <iframe 
                  src={candidateAdminService.getDocumentStreamUrl(candidate.id, selectedDoc.id)}
                  className="w-full h-full"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Pratinjau tidak tersedia untuk format ini.</p>
                  <a 
                    href={candidateAdminService.getDocumentStreamUrl(candidate.id, selectedDoc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 text-primary hover:underline text-sm font-semibold"
                  >
                    Unduh Dokumen
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Dokumen (jika Invalid)</label>
              <input
                type="text"
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                placeholder="Alasan dokumen tidak valid (cth: Foto buram, KTP kadaluarsa)..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary mb-4"
              />
              
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => handleVerifyDocument(selectedDoc.id, "Invalid")}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Tandai Invalid
                </button>
                <button
                  onClick={() => handleVerifyDocument(selectedDoc.id, "Valid")}
                  className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Tandai Valid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
