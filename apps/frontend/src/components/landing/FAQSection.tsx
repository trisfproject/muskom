'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQs = [
  {
    question: 'Siapa yang dapat mendaftar sebagai peserta?',
    answer:
      'Seluruh anggota aktif komunitas berhak mendaftar sebagai peserta musyawarah. Anda perlu menyertakan identitas keanggotaan atau dokumen yang relevan saat pendaftaran.',
  },
  {
    question: 'Apa perbedaan antara Peserta dan Kandidat?',
    answer:
      'Peserta adalah anggota yang hadir, mengikuti, dan memberikan suara dalam musyawarah. Kandidat adalah peserta yang mencalonkan diri sebagai ketua dan wajib menyertakan visi, misi, serta program kerja untuk ditinjau oleh panitia.',
  },
  {
    question: 'Bagaimana cara mengetahui apakah pendaftaran saya disetujui?',
    answer:
      'Anda dapat memeriksa status pendaftaran menggunakan kode registrasi yang diberikan setelah pendaftaran. Notifikasi juga akan dikirimkan melalui email ketika status Anda berubah.',
  },
  {
    question: 'Apakah saya bisa mengubah data pendaftaran setelah submit?',
    answer:
      'Tidak, data pendaftaran yang telah dikirim tidak dapat diubah secara mandiri. Jika terdapat kesalahan data, silakan hubungi panitia musyawarah secara langsung.',
  },
  {
    question: 'Bagaimana mekanisme pemungutan suara dilaksanakan?',
    answer:
      'Pemungutan suara dilakukan secara digital melalui portal ini. Setelah fase voting dibuka, peserta yang telah terverifikasi dapat mengakses surat suara digital menggunakan kode registrasi mereka. Setiap peserta hanya dapat memberikan satu suara.',
  },
  {
    question: 'Kapan hasil pemilihan diumumkan?',
    answer:
      'Hasil pemilihan akan diumumkan setelah fase voting ditutup dan proses penghitungan suara selesai diverifikasi oleh panitia. Hasil resmi dapat diakses melalui halaman Hasil Pemilihan di portal ini.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="heading-xl text-slate-900 mb-4">
            Pertanyaan yang{' '}
            <span className="text-gradient">Sering Diajukan</span>
          </h2>
          <p className="text-lg text-slate-600">
            Temukan jawaban atas pertanyaan umum seputar proses Musyawarah Komunitas.
          </p>
        </div>

        <div className="space-y-3">
          {FAQs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-emerald-200 bg-white shadow-md'
                    : 'border-slate-200 bg-white hover:border-emerald-100 hover:shadow-sm'
                }`}
              >
                <button
                  className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset rounded-2xl"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className={`font-semibold text-base leading-snug ${isOpen ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {faq.question}
                  </span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isOpen ? 'bg-emerald-100 text-emerald-700 rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
