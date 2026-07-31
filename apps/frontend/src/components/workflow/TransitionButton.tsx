"use client";

import { usePermission } from "@/providers/rbac/PermissionProvider";
import { Loader2 } from "lucide-react";

interface TransitionButtonProps {
  label: string;
  requiredPermission?: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success";
}

export function TransitionButton({
  label,
  requiredPermission,
  onClick,
  isLoading = false,
  disabled = false,
  variant = "primary"
}: TransitionButtonProps) {
  const { hasPermission } = usePermission();

  // If a permission is required and the user doesn't have it, don't even render the button
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {label}
    </button>
  );
}
