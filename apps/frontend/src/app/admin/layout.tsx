'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/providers/rbac/PermissionProvider';
import { QueryProvider } from '@/providers/QueryProvider';
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
      <QueryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <PermissionProvider>
          <MasterLayout>
            {children}
          </MasterLayout>
        </PermissionProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
