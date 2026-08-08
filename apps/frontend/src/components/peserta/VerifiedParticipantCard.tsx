import QRCode from "react-qr-code"

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
  // Use public URL for QR checkin. Using window.location.origin for frontend base, 
  // or we could use the env PUBLIC_APP_URL if available to frontend, but window.location.origin is reliable here.
  const appUrl = typeof window !== "undefined" ? window.location.origin : ""
  const qrData = `${appUrl}/checkin/${participant.registration_number}`

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 max-w-sm mx-auto">
      {/* Card Header */}
      <div className="bg-primary px-6 py-4 text-center">
        <h3 className="text-white font-bold tracking-wide">KARTU PESERTA</h3>
        <p className="text-primary-100 text-xs mt-1 uppercase tracking-wider font-semibold">MUSKOM</p>
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
  )
}
