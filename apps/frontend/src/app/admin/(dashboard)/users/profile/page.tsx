"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { userService, UserResponse } from "@/services/admin/user";
import { PageHeader } from "@/components/admin/PageHeader";
import { User, Mail, Shield, KeyRound, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await userService.getMe();
      setProfile(data);
      setFullName(data.full_name);
      setEmail(data.email);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Nama lengkap tidak boleh kosong");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Format email tidak valid");
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await userService.updateMe({
        full_name: fullName.trim(),
        email: email.trim(),
      });
      setProfile(updated);

      // Update cookie user_data for UI sync
      try {
        const prevUserData = Cookies.get("user_data");
        if (prevUserData) {
          const parsed = JSON.parse(prevUserData);
          parsed.full_name = updated.full_name;
          Cookies.set("user_data", JSON.stringify(parsed));
        }
      } catch {}

      toast.success("Profil berhasil diperbarui");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Password saat ini harus diisi");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok");
      return;
    }

    setSavingPassword(true);
    try {
      await userService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Password berhasil diubah!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengubah password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Profil Administrator" 
        description="Kelola informasi akun pribadi dan keamanan autentikasi Anda."
      />

      {loading ? (
        <div className="p-8 text-center pg-muted text-sm animate-pulse">
          Memuat informasi profil...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Overview Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="pg-surface border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-[var(--color-border)] shadow-md mb-4">
                  {profile?.full_name?.charAt(0).toUpperCase() || "A"}
                </div>
                <h3 className="font-bold text-lg pg-text">{profile?.full_name}</h3>
                <p className="text-xs pg-muted mt-0.5">@{profile?.username}</p>

                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)]/10 text-primary border border-[var(--color-primary)]/20">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{profile?.role_name || "Administrator"}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-3 text-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="pg-muted">Status Akun:</span>
                  <span className="font-medium text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="pg-muted">Login Terakhir:</span>
                  <span className="font-medium pg-text">
                    {profile?.last_login_at 
                      ? new Date(profile.last_login_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
                      : "Belum pernah"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Forms Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Update Profile Details Form */}
            <div className="pg-surface border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base pg-text">Informasi Akun</h3>
              </div>
              <p className="text-xs pg-muted mb-6">
                Perbarui nama lengkap dan alamat email yang terhubung dengan akun Anda.
              </p>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold pg-muted uppercase tracking-wider mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm pg-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold pg-muted uppercase tracking-wider mb-2">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      required
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm pg-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold pg-muted uppercase tracking-wider mb-2">
                    Username (Tidak dapat diubah)
                  </label>
                  <input
                    type="text"
                    value={profile?.username || ""}
                    disabled
                    className="w-full bg-[var(--color-bg)]/50 border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm pg-muted cursor-not-allowed"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="pg-surface border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base pg-text">Keamanan & Kata Sandi</h3>
              </div>
              <p className="text-xs pg-muted mb-6">
                Ganti kata sandi secara berkala untuk menjaga keamanan akun administrator Anda.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold pg-muted uppercase tracking-wider mb-2">
                    Kata Sandi Saat Ini
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Masukkan kata sandi saat ini"
                      required
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm pg-text focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold pg-muted uppercase tracking-wider mb-2">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm pg-text focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold pg-muted uppercase tracking-wider mb-2">
                      Ulangi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        required
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm pg-text focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    {savingPassword ? "Memperbarui..." : "Ubah Kata Sandi"}
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
