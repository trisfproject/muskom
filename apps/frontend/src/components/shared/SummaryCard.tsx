import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export function SummaryCard({ title, value, icon, description, className }: SummaryCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-lg border border-slate-200 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}
