"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { userService, UserResponse, RoleResponse } from "@/services/admin/user";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { StatusChip } from "@/components/ui/status-chip";
import { QuickActionMenu } from "@/components/ui/quick-action-menu";
import { ShieldAlert, ShieldCheck, Plus, X, Loader2 } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    role_id: ""
  });

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && user.role !== "SUPER_ADMIN") {
      toast.error("Anda tidak memiliki akses ke halaman ini.");
      router.push("/admin");
    }
  }, [user, authLoading, router]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const res = await userService.listRoles();
      setRoles(res);
      if (res.length > 0) {
        // Set default to ADMIN if available, otherwise first role
        const defaultRole = res.find((r) => r.code === "ADMIN") || res[0];
        setFormState((prev) => ({ ...prev, role_id: defaultRole.id }));
      }
    } catch (err: any) {
      toast.error("Gagal mengambil daftar role");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormState({
      full_name: "",
      email: "",
      username: "",
      password: "",
      role_id: ""
    });
    fetchRoles();
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }
    setSubmitting(true);
    try {
      await userService.createUser(formState);
      toast.success("Pengguna berhasil dibuat");
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal membuat pengguna";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="font-medium pg-text">{row.full_name}</div>
          <div className="text-xs pg-muted">{row.email}</div>
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
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Pengguna & Hak Akses" 
          description="Kelola akun administrator, peran (roles), dan status aktif."
        />
        {user?.role === "SUPER_ADMIN" && (
          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </button>
        )}
      </div>

      <DataTable 
        data={users}
        columns={columns}
        loading={loading}
        onSearch={setSearch}
        searchPlaceholder="Cari nama atau username..."
        emptyMessage="Tidak ada pengguna yang ditemukan."
      />

      {/* Create User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="pg-surface border pg-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b pg-border flex items-center justify-between">
              <h2 className="text-base font-bold pg-text">Tambah Pengguna</h2>
              <button
                onClick={() => !submitting && setModalOpen(false)}
                className="p-1 pg-muted hover:pg-text rounded-lg hover:pg-surface-elevated transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <p className="text-sm pg-muted mb-4">
                Tambahkan akun administrator baru untuk mengelola portal MUSKOM.
              </p>

              <div>
                <label className="block text-xs font-medium pg-text mb-1.5">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap"
                  value={formState.full_name}
                  onChange={(e) => setFormState({ ...formState, full_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-transparent border pg-border rounded-lg focus:outline-none focus:border-[var(--color-primary)] pg-text transition-colors"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-medium pg-text mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-transparent border pg-border rounded-lg focus:outline-none focus:border-[var(--color-primary)] pg-text transition-colors"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-medium pg-text mb-1.5">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={formState.username}
                  onChange={(e) => setFormState({ ...formState, username: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-transparent border pg-border rounded-lg focus:outline-none focus:border-[var(--color-primary)] pg-text transition-colors"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-medium pg-text mb-1.5">Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  value={formState.password}
                  onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-transparent border pg-border rounded-lg focus:outline-none focus:border-[var(--color-primary)] pg-text transition-colors"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-xs font-medium pg-text mb-1.5">Role *</label>
                <select
                  required
                  value={formState.role_id}
                  onChange={(e) => setFormState({ ...formState, role_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-transparent border pg-border rounded-lg focus:outline-none focus:border-[var(--color-primary)] pg-text transition-colors"
                  disabled={submitting || rolesLoading}
                >
                  <option value="" disabled className="bg-[var(--color-surface)]">Pilih Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id} className="bg-[var(--color-surface)]">
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium pg-text hover:bg-[var(--color-surface-elevated)] rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || rolesLoading}
                  className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Buat Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
