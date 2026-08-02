"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { userService, UserResponse } from "@/services/admin/user";
import { SectionHeader } from "@/components/ui/section-header";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Pengguna & Hak Akses" 
        description="Kelola akun administrator, peran (roles), dan status aktif."
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Cari nama atau username..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nama / Email</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Tidak ada pengguna ditemukan</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{user.full_name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{user.username}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {user.role_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleStatus(user)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                          user.is_active 
                            ? "text-rose-400 hover:bg-rose-400/10" 
                            : "text-emerald-400 hover:bg-emerald-400/10"
                        }`}
                      >
                        {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
