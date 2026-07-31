"use client";

import { usePermission } from "@/providers/rbac/PermissionProvider";

interface PermissionGuardProps {
  require: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ require, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermission();

  if (isLoading) return null; // Or a skeleton if preferred

  const requires = Array.isArray(require) ? require : [require];
  
  // By default, require ALL permissions passed in the array. 
  // You can change this to "some" if you want ANY permission to grant access.
  const isAuthorized = requires.every((code) => hasPermission(code));

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
