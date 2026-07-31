'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

function AdminNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (pathname === '/admin/login') return null;

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="font-semibold text-lg text-slate-900">MUSKOM Admin</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 hidden sm:inline-block">
            {user?.full_name || user?.username}
          </span>
          <Button size="sm" onClick={logout} className="bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-none shadow-none">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <AdminNavbar />
          <main className="flex-1">{children}</main>
        </div>
      </AuthProvider>
    </QueryProvider>
  );
}
