"use client"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { ParticipantStatusCard } from "./ParticipantStatusCard"
import { VerifiedParticipantCard } from "./VerifiedParticipantCard"
import api from "@/lib/api"

type LookupResult = {
  participant_name: string
  registration_number: string
  company: string
  job_title: string
  status: string
}

export function ParticipantLookupContent() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LookupResult | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await api.post("/public/register/lookup", { query })
      setResult(res.data.data)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Peserta tidak ditemukan. Silakan periksa kembali Email atau Nomor Registrasi Anda.")
      } else {
        setError("Terjadi kesalahan saat mencari data. Silakan coba lagi nanti.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setQuery("")
    setError(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!result ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="query" className="sr-only">
                Email atau Nomor Registrasi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="query"
                  className="block w-full pl-12 pr-4 py-4 sm:text-lg border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-all"
                  placeholder="Masukkan Email atau Nomor Registrasi"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full flex items-center justify-center py-4 px-8 border border-transparent rounded-2xl text-base font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Mencari...
                </>
              ) : (
                "Cari Data"
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={handleReset}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            ← Kembali ke Pencarian
          </button>
          
          {(result.status.toUpperCase() === "VERIFIED" || result.status.toUpperCase() === "APPROVED") ? (
            <VerifiedParticipantCard participant={result} />
          ) : (
            <ParticipantStatusCard status={result.status} />
          )}
        </div>
      )}
    </div>
  )
}
