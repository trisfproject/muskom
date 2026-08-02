"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { userService, UserResponse } from "@/services/admin/user";
import { SectionHeader } from "@/components/ui/section-header";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { StatusChip } from "@/components/ui/status-chip";
import { QuickActionMenu } from "@/components/ui/quick-action-menu";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.listUsers({ search });
      setUsers(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengambil data pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const toggleStatus = async (user: UserResponse) => {
    try {
      await userService.updateStatus(user.id, !user.is_active);
      toast.success(`Status ${user.full_name} berhasil diubah`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengubah status");
    }
  };

  const columns: ColumnDef<UserResponse>[] = [
    {
      key: "full_name",
      header: "Nama Pengguna",
      render: (row) => (
        <div>
          <div className="font-medium text-white">{row.full_name}</div>
          <div className="text-xs text-slate-500">{row.email}</div>
        </div>
      )
    },
    { key: "username", header: "Username" },
    {
      key: "role_name",
      header: "Role",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-[var(--color-primary)]/10 text-primary border border-[var(--color-primary)]/20">
          {row.role_name}
        </span>
      )
    },
    {
      key: "is_active",
      header: "Status",
      render: (row) => <StatusChip status={row.is_active ? "Active" : "Archived"} />
    },
    {
      key: "id",
      header: "",
      sortable: false,
      render: (row) => (
        <div className="flex justify-end">
          <QuickActionMenu 
            items={[
              {
                label: row.is_active ? "Nonaktifkan Akun" : "Aktifkan Akun",
                icon: row.is_active ? ShieldAlert : ShieldCheck,
                onClick: () => toggleStatus(row),
                variant: row.is_active ? "danger" : "success"
              }
            ]} 
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Pengguna & Hak Akses" 
        description="Kelola akun administrator, peran (roles), dan status aktif."
      />

      <DataTable 
        data={users}
        columns={columns}
        loading={loading}
        onSearch={setSearch}
        searchPlaceholder="Cari nama atau username..."
        emptyMessage="Tidak ada pengguna yang ditemukan."
      />
    </div>
  );
}
