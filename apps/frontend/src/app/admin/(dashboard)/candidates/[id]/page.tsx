"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Calendar,
  MapPin,
  Briefcase,
  Upload,
  Edit3,
  X,
  Mail,
  Phone,
  Building2,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import {
  candidateAdminService,
  CandidateAdminResponse,
  CandidateAdminDocumentResponse,
} from "@/services/candidate-admin";
import api from "@/lib/api";
import { toast } from "sonner";

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

  // Publication state
  const [pubStatus, setPubStatus] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [candidateNumber, setCandidateNumber] = useState<number | "">("");
  const [showBio, setShowBio] = useState(true);
  const [showVis, setShowVis] = useState(true);
  const [showMis, setShowMis] = useState(true);
  const [showPhoto, setShowPhoto] = useState(true);
  const [savingPub, setSavingPub] = useState(false);

  // Edit Candidate Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await candidateAdminService.getCandidateDetail(id);
      setCandidate(res);
      setVerifyStatus(res.status);
      setVerifyNotes(res.verification_notes || "");
      setPubStatus(res.publication_status || "Hidden");
      setDisplayOrder(res.display_order || 0);
      setCandidateNumber(res.candidate_number ?? "");
      setShowBio(res.show_biography ?? true);
      setShowVis(res.show_vision ?? true);
      setShowMis(res.show_mission ?? true);
      setShowPhoto(res.show_photo ?? true);

      // Audit logs
      try {
        const auditRes = await api.get<{ data: { items: any[] } }>(`/admin/audit?entity_id=${id}`);
        if (auditRes.data?.data?.items) {
          setAudits(auditRes.data.data.items);
        }
      } catch {
        setAudits([]);
      }
    } catch (err) {
      toast.error("Gagal memuat detail kandidat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVerifyCandidate = async () => {
    if (!verifyStatus) return toast.error("Pilih status verifikasi.");
    setVerifying(true);
    try {
      await candidateAdminService.verifyCandidate(id, verifyStatus, verifyNotes);
      toast.success("Status verifikasi kandidat berhasil diperbarui.");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui status verifikasi.");
    } finally {
      setVerifying(false);
    }
  };

  const handlePublishToggle = async () => {
    if (candidate?.status !== "Verified") {
      return toast.error("Kandidat harus berstatus Verified sebelum dapat dipublikasikan.");
    }
    setSavingPub(true);
    try {
      if (pubStatus === "Published") {
        await candidateAdminService.unpublishCandidate(id);
        toast.success("Kandidat berhasil di-unpublish dari website publik.");
      } else {
        await candidateAdminService.publishCandidate(id);
        toast.success("Kandidat berhasil dipublikasikan ke website publik!");
      }
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengubah status publikasi.");
    } finally {
      setSavingPub(false);
    }
  };

  const handleSavePubSettings = async () => {
    setSavingPub(true);
    try {
      await candidateAdminService.updatePublicationSettings(id, {
        candidate_number: candidateNumber === "" ? undefined : Number(candidateNumber),
        display_order: displayOrder,
        show_biography: showBio,
        show_vision: showVis,
        show_mission: showMis,
        show_photo: showPhoto,
      });
      toast.success("Pengaturan publikasi berhasil disimpan.");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan pengaturan publikasi.");
    } finally {
      setSavingPub(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size on frontend (default 10MB or NEXT_PUBLIC_MAX_UPLOAD_SIZE)
    const maxUploadSize = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE) || 10485760;
    if (file.size > maxUploadSize) {
      toast.error(`Ukuran file maksimal ${Math.round(maxUploadSize / (1024 * 1024))} MB.`);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setLocalPreview(localUrl);
    setImageError(false);
    setUploadingPhoto(true);

    try {
      await candidateAdminService.uploadPhoto(id, file);
      toast.success("Foto kandidat berhasil diunggah.");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengunggah foto.");
      setLocalPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const openEditModal = () => {
    if (!candidate) return;
    setEditForm({
      full_name: candidate.full_name,
      nickname: candidate.nickname || "",
      email: candidate.email,
      phone: candidate.phone,
      biography: candidate.biography || "",
      motivation: candidate.motivation || "",
      vision: candidate.vision || "",
      mission: candidate.mission || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await candidateAdminService.updateCandidate(id, editForm);
      toast.success("Data kandidat berhasil diperbarui.");
      setShowEditModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui data kandidat.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleVerifyDocument = async (docId: string, status: "Valid" | "Invalid") => {
    try {
      await candidateAdminService.verifyDocument(id, docId, status, docNotes);
      toast.success(`Dokumen ditandai sebagai ${status}`);
      setSelectedDoc(null);
      setDocNotes("");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memverifikasi dokumen.");
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-sm pg-muted">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        Memuat data kandidat...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-16 text-center text-sm text-red-500">
        Kandidat tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => router.push("/admin/candidates")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Data Induk Kandidat
        </button>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={openEditModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pg-text hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Data
          </button>
          <button
            onClick={fetchData}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pg-text hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Segarkan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Candidate Info & Vision/Mission */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
              <div className="relative group">
                <div className="relative w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  {localPreview ? (
                    <img src={localPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : candidate.profile_photo && !imageError ? (
                    <Image
                      src={candidate.profile_photo}
                      alt="Profile"
                      fill
                      className="object-cover"
                      unoptimized={candidate.profile_photo?.startsWith('/uploads/')}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-3xl font-bold text-slate-400">
                      {candidate.full_name?.charAt(0) || "?"}
                    </span>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 rounded-2xl bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold z-20">
                  <Upload className="w-4 h-4 mb-0.5" />
                  {uploadingPhoto ? "..." : "Ganti Foto"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold pg-text">{candidate.full_name}</h1>
                  {candidate.candidate_number && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      No. Urut #{candidate.candidate_number}
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs pg-muted mt-1 font-semibold">
                  REG: {candidate.registration_number}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted font-medium">Perusahaan</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" /> {candidate.company_name || "-"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted font-medium">Kawasan Industri</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {candidate.industrial_area || "-"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted font-medium">Jabatan</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> {candidate.job_title || "-"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted font-medium">Departemen</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" /> {candidate.department || "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted font-medium">Email</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-blue-500" /> {candidate.email}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted font-medium">Telepon / WhatsApp</span>
                <span className="font-semibold pg-text flex items-center gap-1.5 mt-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" /> {candidate.phone}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs pg-muted font-medium">Nama Panggilan</span>
                <span className="font-semibold pg-text mt-1 block">
                  {candidate.nickname || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Vision, Mission, Biography */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold pg-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Visi, Misi & Gagasan
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider pg-muted mb-2">
                  Visi Kandidat
                </h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-sm pg-text leading-relaxed whitespace-pre-wrap">
                  {candidate.vision || "Belum diisi"}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider pg-muted mb-2">
                  Misi Kandidat
                </h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-sm pg-text leading-relaxed whitespace-pre-wrap">
                  {candidate.mission || "Belum diisi"}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider pg-muted mb-2">
                  Biografi Singkat
                </h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-sm pg-text leading-relaxed whitespace-pre-wrap">
                  {candidate.biography || "Belum diisi"}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider pg-muted mb-2">
                  Motivasi Pencalonan
                </h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl text-sm pg-text leading-relaxed whitespace-pre-wrap">
                  {candidate.motivation || "Belum diisi"}
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold pg-text mb-4">Dokumen & Berkas Pendukung</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(!candidate.documents || candidate.documents.length === 0) && (
                <p className="text-sm pg-muted col-span-2">Tidak ada berkas yang diunggah.</p>
              )}
              {candidate.documents?.map((doc: CandidateAdminDocumentResponse) => (
                <div
                  key={doc.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between bg-slate-50/40 dark:bg-slate-800/30"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-sm pg-text">{doc.document_type}</h4>
                      {doc.verification_status === "Valid" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {doc.verification_status === "Invalid" && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {(!doc.verification_status || doc.verification_status === "Pending") && (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <p className="text-xs pg-muted truncate mb-1" title={doc.original_filename}>
                      {doc.original_filename}
                    </p>
                    <p className="text-[10px] pg-muted">
                      {(doc.file_size / 1024).toFixed(1)} KB •{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString("id-ID")}
                    </p>

                    {doc.verification_notes && (
                      <div className="mt-2 text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-2 rounded-lg border border-red-200 dark:border-red-800">
                        <strong>Catatan:</strong> {doc.verification_notes}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setDocNotes(doc.verification_notes || "");
                    }}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 min-h-[44px] bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 pg-text font-semibold text-xs rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> Review Dokumen
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Status, Publication & Audit */}
        <div className="space-y-6">
          {/* Status Verifikasi */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold pg-text border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Status Verifikasi
            </h2>

            <div>
              <label className="block text-xs font-semibold pg-text mb-1">Status Kandidat</label>
              <select
                value={verifyStatus}
                onChange={(e) => setVerifyStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
              >
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted (Menunggu Review)</option>
                <option value="Under Review">Under Review</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Verified">Verified (Terverifikasi)</option>
                <option value="Rejected">Rejected (Ditolak)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold pg-text mb-1">
                Catatan Verifikasi / Alasan
              </label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Catatan verifikasi atau alasan penolakan..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-xs focus:outline-none focus:border-blue-600 min-h-[90px]"
              />
            </div>

            <button
              onClick={handleVerifyCandidate}
              disabled={verifying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 min-h-[44px] px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Simpan Status Verifikasi
            </button>
          </div>

          {/* Publication & Website Sync */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold pg-text border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Publikasi ke Website Publik
            </h2>

            <div>
              <label className="block text-xs font-semibold pg-text mb-2">Status Publikasi</label>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      pubStatus === "Published" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  <span className="text-sm font-semibold pg-text">{pubStatus}</span>
                </div>
                <button
                  onClick={handlePublishToggle}
                  disabled={savingPub || candidate.status !== "Verified"}
                  className={`px-3.5 py-2.5 min-h-[40px] rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center ${
                    pubStatus === "Published"
                      ? "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {pubStatus === "Published" ? "Unpublish" : "Publish Sekarang"}
                </button>
              </div>
              {candidate.status !== "Verified" && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
                  Kandidat harus berstatus Verified untuk dapat dipublikasikan.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold pg-text mb-1">Nomor Urut</label>
                <input
                  type="number"
                  value={candidateNumber}
                  onChange={(e) =>
                    setCandidateNumber(e.target.value === "" ? "" : parseInt(e.target.value))
                  }
                  placeholder="-"
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold pg-text mb-1">Urutan Tampilan</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold pg-text">Tampilkan ke Publik</label>
              <label className="flex items-center gap-2 text-xs pg-text cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={showPhoto}
                  onChange={(e) => setShowPhoto(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Foto Profil Kandidat
              </label>
              <label className="flex items-center gap-2 text-xs pg-text cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={showBio}
                  onChange={(e) => setShowBio(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Biografi Singkat
              </label>
              <label className="flex items-center gap-2 text-xs pg-text cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={showVis}
                  onChange={(e) => setShowVis(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Visi
              </label>
              <label className="flex items-center gap-2 text-xs pg-text cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={showMis}
                  onChange={(e) => setShowMis(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Misi
              </label>
            </div>

            <button
              onClick={handleSavePubSettings}
              disabled={savingPub}
              className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-2.5 min-h-[44px] px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingPub ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Simpan Pengaturan Publikasi
            </button>
          </div>

          {/* Audit Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold pg-text border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Riwayat Audit
            </h2>
            <div className="space-y-3 mt-4 max-h-60 overflow-y-auto">
              {audits.length === 0 && (
                <p className="text-xs pg-muted">Belum ada riwayat aktivitas.</p>
              )}
              {audits.map((audit) => (
                <div
                  key={audit.id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <p className="font-semibold pg-text">{audit.action}</p>
                  <p className="text-[10px] pg-muted mt-0.5">
                    {new Date(audit.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Edit Modal ─── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold pg-text">Edit Data Kandidat</h2>
                <p className="text-xs pg-muted">{candidate.registration_number}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Nama Panggilan</label>
                  <input
                    type="text"
                    value={editForm.nickname || ""}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Telepon *</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Perusahaan</label>
                  <input
                    type="text"
                    value={editForm.company_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Kawasan Industri</label>
                  <input
                    type="text"
                    value={editForm.industrial_area || ""}
                    onChange={(e) => setEditForm({ ...editForm, industrial_area: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={editForm.job_title || ""}
                    onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Departemen</label>
                  <input
                    type="text"
                    value={editForm.department || ""}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold pg-text block mb-1">Biografi</label>
                <textarea
                  rows={2}
                  value={editForm.biography || ""}
                  onChange={(e) => setEditForm({ ...editForm, biography: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold pg-text block mb-1">Motivasi</label>
                <textarea
                  rows={2}
                  value={editForm.motivation || ""}
                  onChange={(e) => setEditForm({ ...editForm, motivation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Visi</label>
                  <textarea
                    rows={2}
                    value={editForm.vision || ""}
                    onChange={(e) => setEditForm({ ...editForm, vision: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold pg-text block mb-1">Misi</label>
                  <textarea
                    rows={2}
                    value={editForm.mission || ""}
                    onChange={(e) => setEditForm({ ...editForm, mission: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 min-h-[44px] text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 pg-text transition-colors cursor-pointer flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2.5 min-h-[44px] text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
                >
                  {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Document Review Modal ─── */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-bold text-sm pg-text">{selectedDoc.document_type}</h3>
                <p className="text-xs pg-muted">{selectedDoc.original_filename}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative min-h-[300px] sm:min-h-[400px]">
              {selectedDoc.mime_type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={candidateAdminService.getDocumentStreamUrl(candidate.id, selectedDoc.id)}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : selectedDoc.mime_type === "application/pdf" ? (
                <iframe
                  src={candidateAdminService.getDocumentStreamUrl(candidate.id, selectedDoc.id)}
                  className="w-full h-full min-h-[350px] sm:min-h-[450px]"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
                    Pratinjau tidak didukung langsung di peramban.
                  </p>
                  <a
                    href={candidateAdminService.getDocumentStreamUrl(candidate.id, selectedDoc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] mt-4 text-blue-600 hover:underline text-xs font-semibold"
                  >
                    Unduh Berkas
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div>
                <label className="block text-xs font-semibold pg-text mb-1">
                  Catatan Verifikasi Berkas (jika Invalid)
                </label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Alasan berkas tidak valid..."
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 justify-end">
                <button
                  onClick={() => handleVerifyDocument(selectedDoc.id, "Invalid")}
                  className="px-4 py-2.5 min-h-[44px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-200 dark:border-red-800"
                >
                  <XCircle className="w-4 h-4" /> Tandai Invalid
                </button>
                <button
                  onClick={() => handleVerifyDocument(selectedDoc.id, "Valid")}
                  className="px-4 py-2.5 min-h-[44px] bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Tandai Valid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
