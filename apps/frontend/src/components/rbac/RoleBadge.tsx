import { Shield, Lock, Users, UserCheck, ShieldAlert, Eye } from "lucide-react";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleConfig = (r: string) => {
    switch (r?.toUpperCase()) {
      case "SUPER_ADMIN":
        return { color: "bg-purple-100 text-purple-800 border-purple-200", icon: ShieldAlert, label: "Super Admin" };
      case "ADMIN":
        return { color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Shield, label: "Admin" };
      case "COMMITTEE":
        return { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Users, label: "Committee" };
      case "VERIFIER":
        return { color: "bg-green-100 text-green-800 border-green-200", icon: UserCheck, label: "Verifier" };
      case "OPERATOR":
        return { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Lock, label: "Operator" };
      case "VIEWER":
      default:
        return { color: "bg-slate-100 text-slate-800 border-slate-200", icon: Eye, label: "Viewer" };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
}
