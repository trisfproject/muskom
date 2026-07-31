import { ShieldAlert } from "lucide-react";
import Link from "next/link";

interface UnauthorizedStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function UnauthorizedState({
  title = "Access Denied",
  description = "You do not have the required permissions to view this resource. This action has been logged.",
  actionText = "Return to Dashboard",
  actionHref = "/admin/dashboard",
}: UnauthorizedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-lg border border-red-100 shadow-sm">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50">
        <ShieldAlert className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
