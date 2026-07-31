'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import React from 'react';

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Ex: /admin/dashboard -> ["admin", "dashboard"]
  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  // We skip "admin" from the display since we are already in the admin portal
  const displaySegments = pathSegments.filter(segment => segment !== 'admin');

  if (displaySegments.length === 0) {
    displaySegments.push('Dashboard');
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex">
      <ol className="flex items-center space-x-2 text-sm text-slate-500">
        <li>
          <Link href="/admin/dashboard" className="hover:text-slate-900 transition-colors">
            Admin
          </Link>
        </li>
        {displaySegments.map((segment, index) => {
          const isLast = index === displaySegments.length - 1;
          const name = segment.charAt(0).toUpperCase() + segment.slice(1);
          
          return (
            <React.Fragment key={index}>
              <li>
                <ChevronRight className="h-4 w-4" />
              </li>
              <li>
                {isLast ? (
                  <span className="font-medium text-slate-900">{name}</span>
                ) : (
                  <span className="text-slate-500">{name}</span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
