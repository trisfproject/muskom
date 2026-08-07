'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AnnouncementForm from '@/components/admin/announcements/AnnouncementForm';
import { Announcement } from '@/types/announcement';
import { announcementService } from '@/services/announcement';

export default function EditAnnouncementPage() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading announcement...</div>;
  }

  if (!announcement) {
    return <div className="p-8 text-center text-red-500">Announcement not found.</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Announcement</h1>
      </div>
      <AnnouncementForm initialData={announcement} isEdit={true} />
    </div>
  );
}
