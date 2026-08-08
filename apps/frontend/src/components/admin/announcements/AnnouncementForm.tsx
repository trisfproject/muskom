'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '@/types/announcement';
import { announcementService } from '@/services/announcement';
import { toast } from 'sonner';

interface AnnouncementFormProps {
  initialData?: Announcement;
  isEdit?: boolean;
}

export default function AnnouncementForm({ initialData, isEdit }: AnnouncementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: initialData?.title || '',
    category: initialData?.category || 'General',
    priority: initialData?.priority || 'Normal',
    status: initialData?.status || 'Draft',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    pinned: initialData?.pinned || false,
  });

  const categories = ['General', 'Registration', 'Candidate', 'Participant', 'Attendance', 'Voting', 'System', 'Emergency'];
  const priorities = ['Normal', 'Important', 'Urgent', 'Critical'];
  const statuses = ['Draft', 'Scheduled', 'Published', 'Archived'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && initialData) {
        await announcementService.updateAnnouncement(initialData.id, formData as UpdateAnnouncementRequest);
        toast.success('Announcement updated successfully');
      } else {
        await announcementService.createAnnouncement(formData as CreateAnnouncementRequest);
        toast.success('Announcement created successfully');
      }
      router.push('/admin/announcements');
    } catch (error) {
      toast.error('Failed to save announcement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-xl shadow-sm">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label htmlFor="title" className="block text-sm font-semibold pg-text">Judul Pengumuman</label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="block w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="category" className="block text-sm font-semibold pg-text">Kategori</label>
          <div className="mt-1">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="block w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="priority" className="block text-sm font-semibold pg-text">Prioritas</label>
          <div className="mt-1">
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="block w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="status" className="block text-sm font-semibold pg-text">Status</label>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="summary" className="block text-sm font-semibold pg-text">Ringkasan Singkat</label>
          <div className="mt-1">
            <textarea
              id="summary"
              name="summary"
              rows={2}
              value={formData.summary}
              onChange={handleChange}
              className="block w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="content" className="block text-sm font-semibold pg-text">Konten Lengkap</label>
          <div className="mt-1">
            <textarea
              id="content"
              name="content"
              rows={10}
              required
              value={formData.content}
              onChange={handleChange}
              className="block w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pg-text shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-mono"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="pinned"
                name="pinned"
                type="checkbox"
                checked={formData.pinned}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="pinned" className="font-medium pg-text cursor-pointer">Sematkan di atas (Pin to top)</label>
              <p className="pg-muted text-xs">Pengumuman ini akan selalu berada di posisi paling atas feed publik.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg bg-white dark:bg-slate-800 px-4 py-2.5 min-h-[44px] text-sm font-semibold pg-text shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-center"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center items-center rounded-lg bg-indigo-600 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Menyimpan...' : 'Simpan Pengumuman'}
        </button>
      </div>
    </form>
  );
}
