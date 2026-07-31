"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/public-api";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionContextType {
  permissions: string[];
  isLoading: boolean;
  hasPermission: (permissionCode: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  isLoading: true,
  hasPermission: () => false,
});

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    api.get("/auth/me/permissions")
      .then((res) => {
        if (isMounted && res.data?.data) {
          setPermissions(res.data.data as string[]);
        }
      })
      .catch((err) => {
        console.error("Failed to load permissions", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const hasPermission = (code: string) => {
    // SUPER_ADMIN override handled by backend, but we can assume if they have the perm in array they can do it.
    return permissions.includes(code);
  };

  return (
    <PermissionContext.Provider value={{ permissions, isLoading, hasPermission }}>
      {children}
    </PermissionContext.Provider>
  );
}

export const usePermission = () => useContext(PermissionContext);
