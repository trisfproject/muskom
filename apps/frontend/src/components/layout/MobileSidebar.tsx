'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from './nav-links';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function MobileSidebar({ isOpen, setIsOpen }: MobileSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside 
        className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col md:hidden transform transition-transform duration-300 ease-in-out"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <span className="text-xl font-bold tracking-tight text-slate-900">MUSKOM</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors",
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
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
