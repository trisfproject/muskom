'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminIndex() {
  useEffect(() => {
    redirect('/admin/dashboard');
  }, []);

  return null;
}
