'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Announcement } from '@/types/announcement';
import { announcementService } from '@/services/announcement';
import { format } from 'date-fns';
import { Calendar, ArrowLeft } from 'lucide-react';
// If using react-markdown for parsing Markdown content:
// import ReactMarkdown from 'react-markdown';
// For RC1, if it's plain text or HTML we can just render it. We'll use a simple pre-wrap for now.

export default function PengumumanDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchAnnouncement(slug as string);
    }
  }, [slug]);

  const fetchAnnouncement = async (s: string) => {
    try {
      setLoading(true);
      const data = await announcementService.getPublicAnnouncement(s);
      setAnnouncement(data);
    } catch (error) {
      console.error('Failed to fetch public announcement detail:', error);
      // Optional: push to 404 or list if not found
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-32 text-center text-gray-500">Memuat pengumuman...</div>;
  }

  if (!announcement) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Pengumuman Tidak Ditemukan</h2>
        <p className="mt-2 text-gray-500">Pengumuman yang Anda cari mungkin sudah dihapus atau kadaluarsa.</p>
        <Link href="/pengumuman" className="mt-6 inline-flex items-center text-indigo-600 hover:text-indigo-500">
          <ArrowLeft className="mr-2 h-5 w-5" /> Kembali ke Pusat Informasi
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Link href="/pengumuman" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Link>
        <div className="text-center">
          <div className="flex items-center justify-center gap-x-4 text-sm mb-6">
            <time dateTime={announcement.created_at} className="text-gray-500 flex items-center">
              <Calendar className="mr-1 h-5 w-5" />
              {format(new Date(announcement.created_at), 'd MMMM yyyy')}
            </time>
            <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600">
              {announcement.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {announcement.title}
          </h1>
          {announcement.summary && (
            <p className="mt-6 text-xl leading-8 text-gray-600 border-l-4 border-indigo-600 pl-4 text-left">
              {announcement.summary}
            </p>
          )}
        </div>
        <div className="mt-16 bg-gray-50 p-8 rounded-2xl">
          <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
            {announcement.content}
          </div>
        </div>
      </div>
    </div>
  );
}
