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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <div className="mt-1">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
          <div className="mt-1">
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Summary</label>
          <div className="mt-1">
            <textarea
              id="summary"
              name="summary"
              rows={2}
              value={formData.summary}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Konten Lengkap</label>
          <div className="mt-1">
            <textarea
              id="content"
              name="content"
              rows={10}
              required
              value={formData.content}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
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
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="pinned" className="font-medium text-gray-700">Pin to top</label>
              <p className="text-gray-500">This announcement will stay at the top of the public feed.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5 flex justify-end gap-x-3 border-t border-gray-200 mt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
