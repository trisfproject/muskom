import LoginForm from './LoginForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Login Admin — MUSKOM',
  description: 'Portal autentikasi Administrator MUSKOM',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-extrabold text-base">M</span>
          </div>
          <div>
            <div className="text-white font-extrabold text-xl tracking-tight">MUSKOM</div>
            <div className="text-emerald-200 text-xs">Admin Panel</div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Selamat Datang,<br />
            <span className="text-emerald-300">Administrator</span>
          </h1>
          <p className="text-emerald-100/80 text-lg leading-relaxed max-w-sm">
            Kelola seluruh proses Musyawarah Komunitas — dari verifikasi peserta, pemantauan kandidat, hingga pengawasan pemilihan.
          </p>

          <div className="mt-10 space-y-4">
            {[
              'Manajemen Peserta & Kandidat',
              'Verifikasi & Kehadiran',
              'Pemantauan Voting Realtime',
              'Laporan & Audit Log',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-emerald-100/80 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-emerald-200/60 text-xs">
          © {new Date().getFullYear()} MUSKOM — Musyawarah Komunitas
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Back link */}
        <div className="p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Form center */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">
            {/* Mobile brand */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-extrabold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">MUSKOM</h1>
              <p className="text-slate-500 text-sm">Admin Panel</p>
            </div>

            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Masuk ke Panel Admin</h2>
              <p className="text-slate-500 text-sm mt-1">Masukkan kredensial untuk mengakses dashboard.</p>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
