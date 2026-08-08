import { Metadata } from "next"
import { Suspense } from "react"
import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"
import { ParticipantLookupContent } from "@/components/peserta/ParticipantLookupContent"

export const metadata: Metadata = {
  title: "Cek Status Peserta | MUSKOM",
  description: "Periksa status pendaftaran peserta MUSKOM",
}

export default function PesertaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      
      <main className="flex-1 pt-24 sm:pt-32 pb-16">
        <div className="container-landing max-w-4xl px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Cek Status Peserta
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Masukkan Email atau Nomor Registrasi untuk melihat status pendaftaran Anda.
            </p>
          </div>
          
          <Suspense fallback={
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <ParticipantLookupContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
