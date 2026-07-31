'use client';

import { Menu } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { UserMenu } from './UserMenu';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment !== '' && segment !== 'admin');
  const currentPageTitle = pathSegments.length > 0 
    ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + pathSegments[pathSegments.length - 1].slice(1)
    : 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </button>
        
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-slate-900 md:hidden">{currentPageTitle}</h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  );
}
