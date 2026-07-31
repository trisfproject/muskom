import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileBadge,
  ClipboardCheck,
  Vote,
  BarChart3,
  ScrollText,
  Bell,
  Settings,
} from 'lucide-react';

export const navGroups = [
  {
    label: 'Operasional',
    links: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Event', href: '/admin/events', icon: CalendarDays },
    ],
  },
  {
    label: 'Peserta',
    links: [
      { name: 'Peserta', href: '/admin/participants', icon: Users },
      { name: 'Kandidat', href: '/admin/candidates', icon: FileBadge },
      { name: 'Verifikasi', href: '/admin/verification', icon: ClipboardCheck },
      { name: 'Kehadiran', href: '/admin/attendance', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Pemilihan',
    links: [
      { name: 'Voting', href: '/admin/voting', icon: Vote },
      { name: 'Laporan', href: '/admin/reporting', icon: BarChart3 },
    ],
  },
  {
    label: 'Sistem',
    links: [
      { name: 'Audit Log', href: '/admin/audit', icon: ScrollText },
      { name: 'Notifikasi', href: '/admin/notifications', icon: Bell },
      { name: 'Otomasi', href: '/admin/automation', icon: Settings },
    ],
  },
];

// Flat list for mobile sidebar compatibility
export const navLinks = navGroups.flatMap((g) => g.links);
