'use client';

import React from 'react';
import AnnouncementForm from '@/components/admin/announcements/AnnouncementForm';

export default function CreateAnnouncementPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Create Announcement</h1>
      </div>
      <AnnouncementForm />
    </div>
  );
}
