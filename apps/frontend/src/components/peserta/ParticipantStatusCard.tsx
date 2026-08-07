import { Clock, XCircle } from "lucide-react"

interface ParticipantStatusCardProps {
  status: string
}

export function ParticipantStatusCard({ status }: ParticipantStatusCardProps) {
  const isPending = status.toUpperCase() === "PENDING"
  const isRejected = status.toUpperCase() === "REJECTED"

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
      <div className="flex justify-center mb-6">
        {isPending && (
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Clock className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </div>
        )}
        {isRejected && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        {isPending && "⏳ Menunggu Verifikasi"}
        {isRejected && "❌ Ditolak"}
        {!isPending && !isRejected && `Status: ${status}`}
      </h2>

      <div className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        {isPending && (
          <p>
            Pendaftaran Anda telah diterima dan sedang menunggu proses verifikasi panitia. 
            Kami akan memberitahu Anda melalui email setelah verifikasi selesai.
          </p>
        )}
        {isRejected && (
          <p>
            Pendaftaran Anda belum dapat disetujui. Silakan menghubungi Panitia MUSKOM 
            apabila memerlukan informasi lebih lanjut.
          </p>
        )}
        {!isPending && !isRejected && (
          <p>
            Status pendaftaran Anda saat ini adalah <strong>{status}</strong>.
          </p>
        )}
      </div>
    </div>
  )
}
