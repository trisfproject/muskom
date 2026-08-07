'use client';

import React, { useEffect, useState } from 'react';
import { BroadcastJob } from '@/types/announcement';
import { announcementService } from '@/services/announcement';
import { format } from 'date-fns';

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
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Broadcast Jobs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor the status of your queued and completed announcement broadcasts.
          </p>
        </div>
      </div>
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white">
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
