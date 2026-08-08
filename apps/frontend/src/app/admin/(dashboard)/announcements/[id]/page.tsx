'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AnnouncementForm from '@/components/admin/announcements/AnnouncementForm';
import { Announcement } from '@/types/announcement';
import { announcementService } from '@/services/announcement';
import { PageHeader } from '@/components/admin/PageHeader';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <div className="space-y-6">
      <PageHeader
        breadcrumb={
          <Link
            href="/admin/announcements"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors min-h-[36px]"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pengumuman
          </Link>
        }
        title="Edit Pengumuman"
        description={`Mengubah isi pengumuman "${announcement.title}".`}
      />
      <AnnouncementForm initialData={announcement} isEdit={true} />
    </div>
  );
}

