'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Announcement } from '@/types/announcement';
import { announcementService } from '@/services/announcement';
import { format } from 'date-fns';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Megaphone, 
  Send
} from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.listAdminAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengumuman (Announcements)</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola pengumuman resmi dan siarkan kepada peserta, kandidat, atau panitia.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Link
            href="/admin/announcements/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 min-h-[44px] text-center text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Pengumuman
          </Link>
        </div>
      </div>
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Title</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Publish Date</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">Loading announcements...</td>
                    </tr>
                  ) : announcements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-gray-500">No announcements found.</td>
                    </tr>
                  ) : announcements.map((ann) => (
                    <tr key={ann.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          {ann.pinned && <Megaphone className="h-5 w-5 text-indigo-500 mr-2" />}
                          <div className="font-medium text-gray-900">{ann.title}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {ann.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          ann.status === 'Published' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                          ann.status === 'Draft' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                          'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                        }`}>
                          {ann.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {ann.publish_date ? format(new Date(ann.publish_date), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-x-2">
                          <Link href={`/admin/announcements/${ann.id}/broadcast`} className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Broadcast">
                            <Send className="h-4 w-4" />
                          </Link>
                          <Link href={`/admin/announcements/${ann.id}`} className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button onClick={() => handleDelete(ann.id)} className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
