import { MaxWidthWrapper } from "@/components/layout/MaxWidthWrapper"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <MaxWidthWrapper>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-extrabold text-xs">M</span>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                MUSKOM
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">
              Platform resmi musyawarah komunitas. Menjamin proses pemilihan yang transparan, aman, dan dapat diandalkan oleh seluruh anggota.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Beranda</Link></li>
              <li><Link href="#timeline" className="hover:text-emerald-400 transition-colors">Timeline</Link></li>
              <li><Link href="#kandidat" className="hover:text-emerald-400 transition-colors">Kandidat</Link></li>
              <li><Link href="#pengumuman" className="hover:text-emerald-400 transition-colors">Pengumuman</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Pusat Bantuan</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="/admin/login" className="hover:text-emerald-400 transition-colors">Portal Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-sm text-center flex flex-col md:flex-row items-center justify-between">
          <p>&copy; {new Date().getFullYear()} MUSKOM. Hak Cipta Dilindungi.</p>
          <p className="mt-2 md:mt-0">Dibangun untuk Komunitas</p>
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}
