'use client';

import React, { useEffect, useState } from 'react';
import { BroadcastJob } from '@/types/announcement';
import { announcementService } from '@/services/announcement';
import { format } from 'date-fns';
import { PageHeader } from '@/components/admin/PageHeader';
import { Megaphone, Mail, Send, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

function ReminderBlastCard() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ eligible_count: number; subject: string; body: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [blasting, setBlasting] = useState(false);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/notifications/musyawarah-reminder/preview');
      setPreview(res.data?.data);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Failed to load preview:', error);
      toast.error('Gagal memuat pratinjau pengingat');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!preview) return;
    if (!confirm(`Kirim pengingat ke ${preview.eligible_count} peserta?`)) {
      return;
    }
    try {
      setBlasting(true);
      const res = await api.post('/admin/notifications/musyawarah-reminder/blast');
      toast.success(`Berhasil! ${res.data?.data?.queued_count} email masuk ke antrean.`);
      setShowPreviewModal(false);
      // Optional: trigger refresh of jobs table if possible, but it relies on parent state. 
      // For simplicity, we just show toast.
    } catch (error) {
      console.error('Failed to queue blast:', error);
      toast.error('Gagal mengirim blast pengingat');
    } finally {
      setBlasting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-600" /> MUSYAWARAH KOMITKABE 2026
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Kirim blast email pengingat acara (Hadir & QR Registrasi) ke seluruh peserta terverifikasi.
        </p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
        <button
          onClick={fetchPreview}
          disabled={loading || blasting}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" /> {loading ? 'Memuat...' : 'Preview'}
        </button>
      </div>

      {showPreviewModal && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pratinjau Pengingat Acara</h3>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-500">Eligible Recipients:</span>
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{preview.eligible_count}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-500">Subject:</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{preview.subject}</span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-950 text-sm overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: preview.body }} />
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSendReminder}
                disabled={blasting || preview.eligible_count === 0}
                className="px-4 py-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {blasting ? 'Mengirim...' : 'Send Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BroadcastsPage() {
  const [jobs, setJobs] = useState<BroadcastJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await announcementService.listBroadcastJobs();
      setJobs(data || []);
    } catch (error) {
      console.error('Failed to fetch broadcast jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broadcast Jobs"
        description="Monitor status dan riwayat pengiriman siaran pesan massal kepada peserta / panitia."
      />

      <ReminderBlastCard />
      
      
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
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">Loading broadcast jobs...</td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">No broadcast jobs found.</td>
                    </tr>
                  ) : jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {job.id.substring(0, 8)}...
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {job.target_audience}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          job.status === 'Delivered' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                          job.status === 'Queued' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                          job.status === 'Sending' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                          'bg-red-50 text-red-800 ring-red-600/20'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{job.successful_deliveries}</span> / {job.total_targets}
                        {job.failed_deliveries > 0 && <span className="text-red-500 ml-2">({job.failed_deliveries} failed)</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}
                      </td>
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
