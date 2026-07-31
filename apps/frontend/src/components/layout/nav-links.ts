import { LayoutDashboard, CalendarDays, Users, FileBadge } from 'lucide-react';

export const navLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Event', href: '/admin/events', icon: CalendarDays },
  { name: 'Participants', href: '/admin/participants', icon: Users },
  { name: 'Candidates', href: '/admin/candidates', icon: FileBadge },
];
