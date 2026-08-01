"use client"

import { useEffect } from "react"
import { AlertOctagon, RotateCcw } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen pg-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl pg-surface border border-rose-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-rose-500/10">
        <AlertOctagon className="w-10 h-10 text-rose-500" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black pg-text tracking-tight mb-4">
        Terjadi Kesalahan Sistem
      </h1>
      
      <p className="text-lg pg-muted max-w-md mb-10 leading-relaxed">
        Maaf, sistem kami mengalami gangguan saat memproses permintaan Anda. Silakan coba kembali dalam beberapa saat.
      </p>
      
      <button 
        onClick={() => reset()}
        className="pill-btn inline-flex items-center gap-2 px-8 py-4 text-sm font-bold hover:!text-rose-500 hover:!border-rose-500/30"
      >
        <RotateCcw className="w-4 h-4" />
        Coba Lagi
      </button>
    </div>
  )
}
