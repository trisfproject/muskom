import { Users, ShieldCheck, Vote, Award } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Inklusif & Demokratis',
    description:
      'Setiap anggota komunitas memiliki hak yang sama untuk berpartisipasi, menyuarakan pendapat, dan menentukan arah organisasi.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: ShieldCheck,
    title: 'Transparan & Terpercaya',
    description:
      'Seluruh proses mulai dari pendaftaran, verifikasi, hingga pemungutan suara dilaksanakan secara terbuka dan dapat dipertanggungjawabkan.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Vote,
    title: 'Pemilihan Digital',
    description:
      'Pemungutan suara dilakukan secara aman melalui platform digital yang terenkripsi, memastikan kerahasiaan dan validitas setiap suara.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Award,
    title: 'Penentuan Kepemimpinan',
    description:
      'Musyawarah menghasilkan pemimpin yang dipilih secara sah oleh komunitas untuk membawa organisasi ke arah yang lebih baik.',
    color: 'bg-amber-50 text-amber-600',
  },
];

export function AboutSection() {
  return (
    <section id="tentang" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">
            Tentang MUSKOM
          </div>
          <h2 className="heading-xl text-slate-900 mb-6">
            Musyawarah sebagai{' '}
            <span className="text-gradient">Fondasi Komunitas</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            MUSKOM (Musyawarah Komunitas) adalah forum pengambilan keputusan tertinggi yang mempertemukan
            seluruh anggota komunitas untuk bersama-sama menentukan arah dan kepemimpinan organisasi.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 p-8 rounded-2xl gradient-card border border-emerald-100">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '1 Suara', label: 'Setiap Anggota' },
              { value: '100%', label: 'Transparan' },
              { value: 'Digital', label: 'Pemungutan Suara' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-emerald-700 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
