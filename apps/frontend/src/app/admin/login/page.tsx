"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface LoginResponse {
  data: {
    access_token: string
    refresh_token: string
    user: {
      id: string
      username: string
      full_name: string
      role: string
    }
  }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password) return
    setLoading(true)
    setErrorMsg(null)
    
    const payload = {
      username: form.username.trim(),
      password: form.password,
    }

    try {
      const res = await api.post<LoginResponse>("/auth/login", payload)
      const { access_token, refresh_token, user } = res.data.data
      Cookies.set("access_token", access_token, { expires: 1, sameSite: "strict" })
      Cookies.set("refresh_token", refresh_token, { expires: 7, sameSite: "strict" })
      Cookies.set("user_data", JSON.stringify(user), { expires: 1, sameSite: "strict" })
      login(access_token, refresh_token, user)
      toast.success(`Selamat datang, ${user.full_name}`)
      router.push("/admin/dashboard")
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      const msg = e?.response?.data?.message ?? "Username/Email atau Password salah."
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] relative overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-3xl rounded-full bg-[var(--color-primary)]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-full pg-surface blur-[80px] opacity-50" />
      </div>
      <div className="dot-grid absolute inset-0 pointer-events-none opacity-60" />

      {/* Back link */}
      <div className="relative z-10 p-5">
        <Link href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium pg-muted hover:pg-text transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Kembali ke Portal
        </Link>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[420px]">
          {/* Brand */}
          <div className="flex flex-col items-center mb-10">
            <span className="text-3xl font-black tracking-[0.18em] text-[var(--color-primary)] uppercase mb-3 select-none">
              MUSKOM
            </span>
            <h1 className="text-2xl font-black pg-text tracking-tight mb-1">Portal Admin</h1>
            <p className="text-sm pg-muted text-center max-w-xs">
              Masuk menggunakan kredensial administrator yang telah diberikan oleh panitia.
            </p>
          </div>

          {/* Form card */}
          <div className="pg-surface border pg-border rounded-2xl p-6 backdrop-blur-sm shadow-2xl relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error State with consistent height to prevent layout shift */}
              <div className="h-10 w-full mb-2">
                {errorMsg && (
                  <div className="h-full w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center px-4">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {errorMsg}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="username">Username atau Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin atau admin@muskom.local"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    disabled={loading}
                    required
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pg-muted hover:pg-text transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs pg-muted hover:text-primary transition-colors font-medium">
                  Lupa password?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full rounded-xl"
              >
                <Lock className="w-4 h-4" />
                {loading ? "Memproses..." : "Masuk ke Portal"}
              </Button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs pg-faint mt-6">
            Akses terbatas untuk Administrator &amp; Panitia MUSKOM
          </p>
        </div>
      </div>
    </div>
  )
}
