'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Announcement } from '@/types/announcement';
import { announcementService } from '@/services/announcement';
import { toast } from 'sonner';

export default function BroadcastAnnouncementPage() {
  const { id } = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);

  const [audience, setAudience] = useState('Everyone');
  const audiences = ['Everyone', 'Participants', 'Verified Participants', 'Candidates', 'Committee', 'Admins'];
  const [channels, setChannels] = useState<string[]>(['In-App']);

  useEffect(() => {
    if (id) {
      fetchAnnouncement(id as string);
    }
  }, [id]);

  const fetchAnnouncement = async (annId: string) => {
    try {
      const data = await announcementService.getAdminAnnouncement(annId);
      setAnnouncement(data);
    } catch (error) {
      console.error('Failed to fetch announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channel: string) => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (channels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }

    setBroadcasting(true);
    try {
      await announcementService.createBroadcast(id as string, {
        target_audience: audience,
        channels: channels
      });
      toast.success('Broadcast queued successfully');
      router.push('/admin/broadcasts');
    } catch (error) {
      toast.error('Failed to queue broadcast');
      console.error(error);
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading announcement...</div>;
  }

  if (!announcement) {
    return <div className="p-8 text-center text-red-500">Announcement not found.</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Broadcast Announcement</h1>
        <p className="mt-2 text-sm text-gray-700">
          Sending: <span className="font-semibold text-gray-900">{announcement.title}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="text-base font-medium text-gray-900">Target Audience</label>
          <p className="text-sm leading-5 text-gray-500 mb-4">Who do you want to send this announcement to?</p>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {audiences.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="mt-6">
          <label className="text-base font-medium text-gray-900">Channels</label>
          <p className="text-sm leading-5 text-gray-500 mb-4">Select the platforms to broadcast through.</p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="channel-inapp"
                  type="checkbox"
                  checked={channels.includes('In-App')}
                  onChange={() => handleChannelToggle('In-App')}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="channel-inapp" className="font-medium text-gray-700">In-App Notification</label>
                <p className="text-gray-500">Real-time alerts via the website notification bell.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="channel-email"
                  type="checkbox"
                  checked={channels.includes('Email')}
                  onChange={() => handleChannelToggle('Email')}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="channel-email" className="font-medium text-gray-700">Email</label>
                <p className="text-gray-500">Send an HTML email to the target audience.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="channel-telegram"
                  type="checkbox"
                  disabled
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded opacity-50 cursor-not-allowed"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="channel-telegram" className="font-medium text-gray-400">Telegram <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-2">Future</span></label>
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
            disabled={broadcasting}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          >
            {broadcasting ? 'Queueing...' : 'Broadcast Now'}
          </button>
        </div>
      </form>
    </div>
  );
}
