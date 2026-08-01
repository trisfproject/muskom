import { HomeResponse } from "@/types/landing"
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react"
import { SlideUp, SlideInRight } from "@/components/landing/Shared"

// CONTACT
// ─────────────────────────────────────────────────────────────
export function Contact({ data }: { data: HomeResponse | null }) {
  const footer = data?.footer;
  if (!footer) return null;

  return (
    <section id="bantuan" className="pg-bg-blue border-t pg-border relative overflow-hidden">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[50vw] h-[50vw] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />
      <div className="container-landing py-24 lg:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <SlideUp>
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Layanan Bantuan</p>
            <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Sekretariat Panitia</h2>
            <p className="pg-muted text-lg leading-relaxed mb-10 max-w-lg">
              Hubungi layanan bantuan resmi kami untuk pertanyaan teknis, kendala pendaftaran, atau informasi lebih lanjut.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full pg-surface border pg-border flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold pg-text mb-1">Email Resmi</h3>
                  <a href={`mailto:${footer.email}`} className="text-sm pg-muted hover:text-blue-600 transition-colors">{footer.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full pg-surface border pg-border flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold pg-text mb-1">WhatsApp Center</h3>
                  <a href={footer.whatsapp_url} target="_blank" rel="noreferrer" className="text-sm pg-muted hover:text-emerald-600 transition-colors">{footer.whatsapp}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full pg-surface border pg-border flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold pg-text mb-1">Lokasi Sekretariat</h3>
                  <p className="text-sm pg-muted mb-2">{footer.address}</p>
                  {data?.event?.mapsUrl && (
                    <a href={data.event.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-500">
                      Buka di Google Maps <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </SlideUp>
          
          <SlideInRight className="w-full">
            <div className="pg-card p-8 text-center space-y-5 relative overflow-hidden backdrop-blur-xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/10 flex items-center justify-center">
                <Phone className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold pg-text">Butuh Bantuan Cepat?</h3>
              <p className="text-sm pg-muted leading-relaxed">Tim layanan bantuan kami bersiaga pada jam kerja (09:00 - 17:00 WIB).</p>
              <a href={footer.whatsapp_url} target="_blank" rel="noreferrer" className="pill-btn w-full inline-flex justify-center items-center gap-2 px-6 py-4 font-bold text-sm bg-blue-600 text-slate-950 hover:bg-blue-500 border-transparent">
                Hubungi via WhatsApp
              </a>
            </div>
          </SlideInRight>
        </div>
      </div>
    </section>
  )
}
