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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage official announcements and broadcast them to participants, candidates, or admins.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/admin/announcements/create"
            className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            New Announcement
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
                        <div className="flex justify-end gap-x-3">
                          <Link href={`/admin/announcements/${ann.id}/broadcast`} className="text-blue-600 hover:text-blue-900 flex items-center" title="Broadcast">
                            <Send className="h-5 w-5" />
                          </Link>
                          <Link href={`/admin/announcements/${ann.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center">
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button onClick={() => handleDelete(ann.id)} className="text-red-600 hover:text-red-900 flex items-center">
                            <Trash2 className="h-5 w-5" />
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
