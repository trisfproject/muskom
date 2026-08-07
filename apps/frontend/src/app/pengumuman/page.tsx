'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Announcement } from '@/types/announcement';
import { announcementService } from '@/services/announcement';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

export default function InformasiPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.listPublicAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Failed to fetch public announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(announcements.map(a => a.category)))];

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(search.toLowerCase()) || 
                          (ann.summary && ann.summary.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || ann.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Pusat Informasi & Pengumuman</h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Dapatkan informasi terbaru seputar MUSKOM dan jadwal kegiatan.
          </p>
        </div>
        
        <div className="mx-auto mt-12 max-w-2xl flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full sm:w-80 rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="block w-full sm:w-48 rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-10">Memuat pengumuman...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">Tidak ada pengumuman yang sesuai.</div>
          ) : (
            filteredAnnouncements.map((ann) => (
              <article key={ann.id} className="flex flex-col items-start justify-between bg-white rounded-2xl ring-1 ring-gray-200 p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={ann.created_at} className="text-gray-500 flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {format(new Date(ann.created_at), 'd MMMM yyyy')}
                  </time>
                  <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100">
                    {ann.category}
                  </span>
                  {ann.pinned && (
                    <span className="relative z-10 rounded-full bg-indigo-50 px-3 py-1.5 font-medium text-indigo-600">
                      Pinned
                    </span>
                  )}
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                    <Link href={`/pengumuman/${ann.slug}`}>
                      <span className="absolute inset-0" />
                      {ann.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                    {ann.summary || 'Klik untuk membaca selengkapnya.'}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
