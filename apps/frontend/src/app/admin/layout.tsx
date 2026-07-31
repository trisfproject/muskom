'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/providers/rbac/PermissionProvider';
import { EventProvider } from '@/providers/event/EventProvider';
import { AdminLayout as MasterLayout } from '@/components/layout/AdminLayout';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  if (pathname === '/admin/login') {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  }

    <AuthProvider>
      <PermissionProvider>
        <EventProvider>
          <MasterLayout>
            {children}
          </MasterLayout>
        </EventProvider>
      </PermissionProvider>
    </AuthProvider>
}
