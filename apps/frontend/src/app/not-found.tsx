"use client"

import Link from "next/link"
import { ArrowLeft, SearchX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen pg-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl pg-surface border pg-border flex items-center justify-center mb-8 shadow-2xl">
        <SearchX className="w-10 h-10 text-primary" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black pg-text tracking-tight mb-4">
        Halaman Tidak Ditemukan
      </h1>
      
      <p className="text-lg pg-muted max-w-md mb-10 leading-relaxed">
        Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau memang tidak pernah ada.
      </p>
      
      <Link href="/" className="pill-btn inline-flex items-center gap-2 px-8 py-4 text-sm font-bold">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>
    </div>
  )
}
