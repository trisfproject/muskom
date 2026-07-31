"use client";

import Link from "next/link";
import { Users, Award, Inbox, PieChart, FileText, Settings, Bell } from "lucide-react";

export function QuickActionsPanel() {
  const actions = [
    { title: "Manage Participants", icon: <Users className="w-5 h-5 mb-2" />, href: "/admin/participants", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Candidate Verification", icon: <Award className="w-5 h-5 mb-2" />, href: "/admin/verifications", color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Attendance Booth", icon: <Inbox className="w-5 h-5 mb-2" />, href: "/admin/attendance", color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Voting Center", icon: <PieChart className="w-5 h-5 mb-2" />, href: "/admin/voting", color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Reporting & Export", icon: <FileText className="w-5 h-5 mb-2" />, href: "/admin/reporting", color: "text-slate-600", bg: "bg-slate-50" },
    { title: "Notifications", icon: <Bell className="w-5 h-5 mb-2" />, href: "/admin/notifications", color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Event Settings", icon: <Settings className="w-5 h-5 mb-2" />, href: "/admin/musyawarah", color: "text-slate-600", bg: "bg-slate-100" },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 h-full">
      <h3 className="text-lg font-medium text-slate-900 mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {actions.map((act) => (
          <Link 
            key={act.title} 
            href={act.href}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border border-transparent hover:border-slate-200 hover:shadow-sm transition-all text-center ${act.bg} hover:bg-white cursor-pointer group`}
          >
            <div className={`${act.color} group-hover:scale-110 transition-transform`}>
              {act.icon}
            </div>
            <span className="text-xs font-medium text-slate-700 leading-tight">
              {act.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
