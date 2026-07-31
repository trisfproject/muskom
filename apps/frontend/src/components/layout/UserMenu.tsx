'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ChevronDown, User as UserIcon } from 'lucide-react';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md p-2 hover:bg-slate-100 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-medium text-sm">
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
        </div>
        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-sm font-medium text-slate-900 leading-none">{user?.full_name || user?.username}</span>
          <span className="text-xs text-slate-500 mt-1">{user?.role || 'Administrator'}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
            <p className="text-sm font-medium text-slate-900">{user?.full_name || user?.username}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Administrator'}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
