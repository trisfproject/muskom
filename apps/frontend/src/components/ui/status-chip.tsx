import React from "react";
import { cn } from "@/lib/utils";

export type StatusType = 
  | "Draft" 
  | "Published" 
  | "Active" 
  | "Archived" 
  | "Pending" 
  | "Verified" 
  | "Rejected" 
  | "Cancelled" 
  | "Completed";

interface StatusChipProps {
  status: StatusType | string;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const getStatusStyles = (s: string) => {
    switch (s.toUpperCase()) {
      case "PUBLISHED":
      case "ACTIVE":
      case "VERIFIED":
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "REJECTED":
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "DRAFT":
      case "ARCHIVED":
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  // Capitalize first letter, lowercase the rest
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border",
        getStatusStyles(status),
        className
      )}
    >
      {formattedStatus}
    </span>
  );
}
