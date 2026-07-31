import Link from 'next/link';
import { Mail, ExternalLink } from 'lucide-react';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-extrabold text-xs">M</span>
              </div>
              <span className="text-white text-xl font-extrabold tracking-tight">MUSKOM</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Portal resmi Musyawarah Komunitas — platform pendaftaran peserta, pendaftaran kandidat,
              dan pemungutan suara digital yang transparan dan terpercaya.
            </p>
            <div className="flex items-center gap-2 mt-6 text-sm text-slate-500">
              <Mail className="w-4 h-4" />
              <span>info@muskom.org</span>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Tentang MUSKOM', href: '#tentang' },
                { label: 'Kandidat', href: '#kandidat' },
                { label: 'Timeline', href: '#timeline' },
                { label: 'FAQ', href: '#faq' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Peserta</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Daftar sebagai Peserta', href: '/register' },
                { label: 'Daftar sebagai Kandidat', href: '/register/candidate' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-800">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors duration-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Portal Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            &copy; {currentYear} MUSKOM — Musyawarah Komunitas. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <Link href="#" className="hover:text-slate-400 transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
