'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { BroadcastJob } from '@/types/announcement';
import { announcementService } from '@/services/announcement';
import { format } from 'date-fns';
import { PageHeader } from '@/components/admin/PageHeader';
import {
  Megaphone, Send, Eye, X, Users, Search,
  CheckSquare, Square, ChevronLeft, ChevronRight,
  Code, Mail, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStyles,
  BtnBulletList,
  BtnNumberedList,
  BtnLink,
  BtnUndo,
  BtnRedo,
} from 'react-simple-wysiwyg';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReminderRecipient = {
  id: string;
  email: string;
  full_name: string;
  registration_number: string;
  status: string;
};

type PreviewData = {
  eligible_count: number;
  recipients: ReminderRecipient[];
  subject: string;
  body: string;
};

type BlastResult = {
  requested: number;
  eligible: number;
  queued: number;
  skipped: number;
};

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const upper = status?.toUpperCase();
  const cls =
    upper === 'APPROVED'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
      : upper === 'VERIFIED'
      ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
      : 'bg-slate-50 text-slate-600 ring-slate-500/10';
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {upper}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Confirmation Dialog
// ---------------------------------------------------------------------------

function ConfirmDialog({
  count,
  onConfirm,
  onCancel,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Konfirmasi Pengiriman</h3>
            <p className="text-sm text-slate-500 mt-1">
              Kirim pengingat ke <strong className="text-slate-900 dark:text-white">{count} penerima</strong>?
              Email akan masuk ke antrean pengiriman.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Kirim Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BroadcastComposer — the full composer modal
// ---------------------------------------------------------------------------

function BroadcastComposer({
  onClose,
  onBlasted,
}: {
  onClose: () => void;
  onBlasted: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [recipients, setRecipients] = useState<ReminderRecipient[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [tab, setTab] = useState<'compose' | 'preview'>('compose');
  const [blasting, setBlasting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recipPage, setRecipPage] = useState(1);
  const RECIP_LIMIT = 10;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [savingDraft, setSavingDraft] = useState(false);

  // Load preview data and draft on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Load eligible recipients (always fresh)
        const previewRes = await api.get('/admin/notifications/musyawarah-reminder/preview');
        const previewData: PreviewData = previewRes.data?.data;
        setRecipients(previewData.recipients ?? []);

        // Attempt to load draft
        const draftRes = await api.get('/admin/notifications/musyawarah-reminder/draft');
        const draftData = draftRes.data?.data;

        if (draftData) {
          setSubject(draftData.subject || '');
          setBody(draftData.body_html || '');
          setSelected(new Set(draftData.recipient_ids || []));
        } else {
          setSubject(previewData.subject || '');
          setBody(previewData.body || '');
          setSelected(new Set((previewData.recipients ?? []).map((r) => r.id)));
        }
      } catch {
        toast.error('Gagal memuat data composer');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [onClose]);

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      await api.post('/admin/notifications/musyawarah-reminder/draft', {
        subject,
        body_html: body,
        recipient_ids: Array.from(selected),
      });
      toast.success('Draft berhasil disimpan');
    } catch (err) {
      toast.error('Gagal menyimpan draft');
    } finally {
      setSavingDraft(false);
    }
  };

  // Live iframe update when body changes or tab switches to preview
  useEffect(() => {
    if (tab === 'preview' && iframeRef.current) {
      const doc = iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(body);
        doc.close();
      }
    }
  }, [tab, body]);

  // ---------------------------------------------------------------------------
  // Filtered + paginated recipient list
  // ---------------------------------------------------------------------------
  const filtered = search
    ? recipients.filter(
        (r) =>
          r.full_name.toLowerCase().includes(search.toLowerCase()) ||
          r.email.toLowerCase().includes(search.toLowerCase()) ||
          r.registration_number.toLowerCase().includes(search.toLowerCase())
      )
    : recipients;

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / RECIP_LIMIT));
  const start = (recipPage - 1) * RECIP_LIMIT;
  const paged = filtered.slice(start, start + RECIP_LIMIT);

  const selectedCount = selected.size;
  const allSelected = recipients.length > 0 && recipients.every((r) => selected.has(r.id));

  // ---------------------------------------------------------------------------
  // Selection handlers
  // ---------------------------------------------------------------------------
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(recipients.map((r) => r.id)));
  const deselectAll = () => setSelected(new Set());

  // ---------------------------------------------------------------------------
  // Blast
  // ---------------------------------------------------------------------------
  const handleBlast = async () => {
    setShowConfirm(false);
    if (selected.size === 0) return;

    try {
      setBlasting(true);
      const res = await api.post('/admin/notifications/musyawarah-reminder/blast', {
        recipient_ids: Array.from(selected),
        subject,
        body,
      });
      const result: BlastResult = res.data?.data;
      toast.success(
        `Berhasil! ${result.queued} email masuk antrean. ` +
          (result.skipped > 0 ? `${result.skipped} dilewati (sudah dikirim / tidak eligible).` : '')
      );
      onBlasted();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal mengirim blast pengingat';
      toast.error(msg);
    } finally {
      setBlasting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Memuat composer...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] overflow-hidden">

          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">Kirim Pengingat Acara</h2>
                <p className="text-xs text-slate-500">MUSYAWARAH KOMITKABE 2026</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">

            {/* ── SECTION 1: PENERIMA ── */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Penerima</span>
                </div>
                <span className="text-xs text-slate-400">{recipients.length} peserta eligible</span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={selectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Square className="w-3.5 h-3.5" /> Deselect All
                </button>
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setRecipPage(1); }}
                    placeholder="Cari nama / email / registrasi..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Recipient table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60">
                    <tr>
                      <th className="w-10 py-2 pl-3" />
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">No. Registrasi</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                          Tidak ada peserta ditemukan.
                        </td>
                      </tr>
                    ) : (
                      paged.map((r) => (
                        <tr
                          key={r.id}
                          onClick={() => toggleOne(r.id)}
                          className={`cursor-pointer transition-colors ${
                            selected.has(r.id)
                              ? 'bg-indigo-50/60 dark:bg-indigo-900/10'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="pl-3 py-2.5">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              selected.has(r.id)
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {selected.has(r.id) && (
                                <svg viewBox="0 0 12 10" className="w-2.5 h-2" fill="none">
                                  <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">{r.registration_number || '—'}</td>
                          <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-white text-xs">{r.full_name}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-500 hidden sm:table-cell truncate max-w-[180px]">{r.email}</td>
                          <td className="px-3 py-2.5"><StatusBadge status={r.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination + selected counter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {totalPages > 1 && (
                    <>
                      <button
                        onClick={() => setRecipPage((p) => Math.max(1, p - 1))}
                        disabled={recipPage <= 1}
                        className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs text-slate-500">{recipPage} / {totalPages}</span>
                      <button
                        onClick={() => setRecipPage((p) => Math.min(totalPages, p + 1))}
                        disabled={recipPage >= totalPages}
                        className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <p className={`text-xs font-semibold ${selectedCount > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {selectedCount === 0
                    ? 'Pilih minimal satu penerima untuk melanjutkan.'
                    : selectedCount === recipients.length
                    ? `${selectedCount} dari ${recipients.length} dipilih (semua)`
                    : `${selectedCount} dari ${recipients.length} dipilih`}
                </p>
              </div>
            </div>

            {/* ── SECTION 2: SUBJECT ── */}
            <div className="p-5 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Judul email..."
                className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
              />
            </div>

            {/* ── SECTION 3: BODY EDITOR / PREVIEW ── */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pesan Email</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                  <button
                    onClick={() => setTab('compose')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      tab === 'compose'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" /> Editor
                  </button>
                  <button
                    onClick={() => setTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      tab === 'preview'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>
              </div>

              {tab === 'compose' ? (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white text-slate-900">
                  <EditorProvider>
                    <Editor
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      containerProps={{ style: { height: '320px', border: 'none' } }}
                    >
                      <Toolbar>
                        <BtnUndo />
                        <BtnRedo />
                        <BtnBold />
                        <BtnItalic />
                        <BtnUnderline />
                        <BtnStyles />
                        <BtnBulletList />
                        <BtnNumberedList />
                        <BtnLink />
                      </Toolbar>
                    </Editor>
                  </EditorProvider>
                </div>
              ) : (
                /* Preview iframe — white background, isolated from dark overlay */
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white" style={{ height: '320px' }}>
                  <iframe
                    ref={iframeRef}
                    title="Email Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin"
                    style={{ background: '#ffffff' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
            <p className={`text-sm font-medium ${selectedCount === 0 ? 'text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
              {selectedCount === 0
                ? 'Belum ada penerima dipilih'
                : `${selectedCount} penerima terpilih`}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={savingDraft || !subject.trim() || !body.trim()}
                className="px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
              >
                {savingDraft ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={blasting || selectedCount === 0 || !subject.trim() || !body.trim()}
                className="px-5 py-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {blasting ? 'Mengirim...' : `Kirim Pengingat → ${selectedCount} penerima`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          count={selectedCount}
          onConfirm={handleBlast}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// ReminderBlastCard — card on the broadcasts page
// ---------------------------------------------------------------------------

function ReminderBlastCard({ onOpenComposer }: { onOpenComposer: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-600" /> MUSYAWARAH KOMITKABE 2026
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Kirim blast email pengingat acara ke peserta terverifikasi — pilih penerima &amp; edit pesan sebelum mengirim.
        </p>
      </div>
      <button
        onClick={onOpenComposer}
        className="flex-none flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
      >
        <Mail className="w-4 h-4" /> Buat Blast Email
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BroadcastsPage
// ---------------------------------------------------------------------------

export default function BroadcastsPage() {
  const [jobs, setJobs] = useState<BroadcastJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await announcementService.listBroadcastJobs();
      setJobs(data || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDraft = useCallback(async () => {
    try {
      const res = await api.get('/admin/notifications/musyawarah-reminder/draft');
      if (res.data?.data && res.data.data.status === 'DRAFT') {
        setDraft(res.data.data);
      } else {
        setDraft(null);
      }
    } catch {
      setDraft(null);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchDraft();
  }, [fetchJobs, fetchDraft]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broadcast Email"
        description="Monitor status dan riwayat pengiriman siaran pesan massal kepada peserta / panitia."
      />

      {draft && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Draft Tersimpan</span>
              <span className="text-xs text-slate-500">Last updated: {format(new Date(draft.updated_at), 'dd MMM yyyy HH:mm')}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{draft.subject}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {(draft.recipient_ids || []).length} penerima terpilih
            </p>
          </div>
          <button
            onClick={() => setShowComposer(true)}
            className="flex-none px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
          >
            Lanjutkan Draft
          </button>
        </div>
      )}

      <ReminderBlastCard onOpenComposer={() => setShowComposer(true)} />

      {showComposer && (
        <BroadcastComposer
          onClose={() => {
            setShowComposer(false);
            fetchDraft(); // refresh draft when composer closes
          }}
          onBlasted={() => {
            fetchJobs();
            fetchDraft(); // draft status might have changed to SENT
          }}
        />
      )}

      <div className="mt-6 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 sm:rounded-xl bg-white dark:bg-slate-900">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Target</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Success / Total</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-500">Loading broadcast jobs...</td></tr>
                  ) : jobs.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-500">No broadcast jobs found.</td></tr>
                  ) : jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{job.id.substring(0, 8)}...</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{job.target_audience}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          job.status === 'Delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          job.status === 'Queued' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                          job.status === 'Sending' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                          'bg-red-50 text-red-800 ring-red-600/20'
                        }`}>{job.status}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{job.successful_deliveries}</span> / {job.total_targets}
                        {job.failed_deliveries > 0 && <span className="text-red-500 ml-2">({job.failed_deliveries} failed)</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
