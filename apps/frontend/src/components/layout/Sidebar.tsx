'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from './nav-links';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <span className="text-xl font-bold tracking-tight text-slate-900">MUSKOM</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-slate-100 text-slate-900" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <link.icon className={cn("h-5 w-5", isActive ? "text-slate-900" : "text-slate-500")} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
