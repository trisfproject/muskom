"use client"

import QRCode from "react-qr-code"
import { useRef, useState } from "react"
import * as htmlToImage from "html-to-image"
import { toast } from "sonner"
import { Download, Loader2 } from "lucide-react"
import { useSystemConfig } from "@/contexts/ConfigContext"

interface VerifiedParticipantCardProps {
  participant: {
    participant_name: string
    registration_number: string
    company: string
    job_title: string
    status: string
  }
}

export function VerifiedParticipantCard({ participant }: VerifiedParticipantCardProps) {
  const { config } = useSystemConfig()
  const eventName = config?.website_identity?.website_title || "MUSYAWARAH"
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Use public URL for QR checkin. Using window.location.origin for frontend base, 
  // or we could use the env PUBLIC_APP_URL if available to frontend, but window.location.origin is reliable here.
  const appUrl = typeof window !== "undefined" ? window.location.origin : ""
  const qrData = `${appUrl}/checkin/${participant.registration_number}`

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return
    
    try {
      setIsDownloading(true)
      
      // Ensure fonts are fully loaded
      if (document.fonts) {
        await document.fonts.ready
      }
      
      // Small delay to ensure QR and layout are fully painted
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const node = cardRef.current
      
      const width = node.offsetWidth
      const height = node.offsetHeight
      
      const dataUrl = await htmlToImage.toPng(node, {
        quality: 1.0,
        pixelRatio: 3, // High resolution
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        style: {
          // Reset any transforms or layout constraints during capture
          transform: 'none',
          width: `${width}px`,
          height: `${height}px`,
          margin: '0',
          borderRadius: '24px', // Match the rounded-3xl class approximately
        }
      })
      
      const link = document.createElement("a")
      link.download = `Kartu-Peserta-${participant.registration_number}.png`
      link.href = dataUrl
      link.click()
      
    } catch (error) {
      console.error("Failed to generate participant card:", error)
      toast.error("Gagal membuat kartu peserta. Silakan coba lagi.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* The Card */}
      <div 
        ref={cardRef}
        className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 w-full max-w-sm mx-auto"
      >
        {/* Card Header */}
        <div className="bg-primary px-6 py-4 text-center">
          <h3 className="text-white font-bold tracking-wider text-base sm:text-lg">KARTU PESERTA</h3>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 uppercase tracking-wider font-semibold">{eventName}</p>
        </div>
        
        {/* Card Body */}
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <QRCode
                value={qrData}
                size={180}
                level="M"
              />
            </div>
          </div>

          <div className="space-y-4 text-center">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
                Nama Peserta
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {participant.participant_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
                Perusahaan
              </p>
              <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                {participant.company}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {participant.job_title}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/50 border-dashed">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
                Nomor Registrasi
              </p>
              <p className="text-xl font-mono font-bold text-primary tracking-widest">
                {participant.registration_number}
              </p>
            </div>
            
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {participant.status.toUpperCase() === "VERIFIED" || participant.status.toUpperCase() === "APPROVED" 
                  ? "TERVERIFIKASI" 
                  : participant.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-full font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm w-full max-w-sm mx-auto"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Download Kartu Peserta</span>
          </>
        )}
      </button>
    </div>
  )
}
