'use client';

import React from 'react';
import AnnouncementForm from '@/components/admin/announcements/AnnouncementForm';
import { PageHeader } from '@/components/admin/PageHeader';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateAnnouncementPage() {
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
        title="Buat Pengumuman Baru"
        description="Publikasikan pengumuman resmi terkait jalannya kegiatan musyawarah."
      />
      <AnnouncementForm />
    </div>
  );
}

