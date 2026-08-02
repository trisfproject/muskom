import { Metadata } from "next";
import { websiteService } from "@/services/website";
import { ThemeWrapper } from "@/components/landing/ThemeWrapper";
import { Container } from "@/components/ui/layout";
import { Footer } from "@/components/landing/Footer";
import { landingService } from "@/services/landing";
import { FileText, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

type Props = {
  params: Promise<{ slug: string }>;
};

const DEFAULT_PAGES_FALLBACK: Record<string, { title: string; content: string }> = {
  "tata-tertib-musyawarah": {
    title: "Tata Tertib Musyawarah",
    content: `# Tata Tertib Musyawarah Komunitas

## 1. Ketentuan Umum
Musyawarah Komunitas (MUSKOM) 2026 merupakan forum musyawarah tertinggi bagi seluruh anggota komunitas dalam menentukan arah strategis organisasi serta memilih Ketua Komunitas periode 2026–2028.

## 2. Kuorum & Keabsahan
1. Musyawarah dinyatakan sah dan mencapai kuorum apabila dihadiri oleh sekurang-kurangnya 50% + 1 dari total anggota terdaftar yang memiliki hak suara.
2. Apabila kuorum belum tercapai, sidang diskors selama 15 menit dan dibuka kembali dengan persetujuan pimpinan sidang.

## 3. Hak dan Kewajiban Peserta
- **Hak Bicara**: Setiap peserta berhak menyampaikan pandangan, usulan, dan pertanyaan melalui mekanisme pimpinan sidang.
- **Hak Suara**: Peserta terverifikasi berhak memberikan 1 (satu) suara pada pemilihan ketua.
- **Kewajiban**: Seluruh peserta wajib menjaga ketertiban, etika komunikasi, dan kelancaran musyawarah.

## 4. Pengambilan Keputusan
Pengambilan keputusan diutamakan melalui musyawarah untuk mufakat. Apabila mufakat tidak tercapai, keputusan diambil melalui pemungutan suara (e-voting) secara tertutup dan transparan.`
  },
  "tata-cara-pemilihan": {
    title: "Tata Cara Pemilihan",
    content: `# Tata Cara Pemilihan Ketua Komunitas

## 1. Prinsip Pemilihan
Pemilihan dilaksanakan berdasarkan asas Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil (LUBER JURDIL) melalui platform digital MUSKOM.

## 2. Syarat Pemilih
1. Telah terdaftar secara resmi sebagai anggota komunitas aktif.
2. Telah melakukan verifikasi kehadiran pada sesi musyawarah.
3. Memiliki token pemilih digital unik yang diterbitkan oleh sistem.

## 3. Alur Pemungutan Suara (E-Voting)
1. **Autentikasi**: Pemilih masuk ke sistem menggunakan kredensial terverifikasi.
2. **Bilik Suara Digital**: Pemilih mengakses halaman pemilihan kandidat resmi.
3. **Pemberian Suara**: Pemilih memilih 1 (satu) pasangan calon / kandidat pilihan.
4. **Konfirmasi & Enkripsi**: Pilihan dienkripsi secara kriptografis dan dicatat ke dalam audit trail database.
5. **Bukti Suara**: Sistem menerbitkan hash transaksi sebagai bukti partisipasi tanpa mengungkap pilihan pemilih.

## 4. Penghitungan & Rekapitulasi
Penghitungan suara dilakukan secara otomatis real-time melalui sistem setelah sesi voting ditutup oleh Panitia Pemilihan.`
  },
  "panduan-peserta": {
    title: "Panduan Peserta",
    content: `# Panduan Lengkap Peserta Musyawarah

## 1. Registrasi & Verifikasi Kehadiran
Setiap peserta diharapkan memastikan akun terdaftar dan melakukan presensi kehadiran digital sebelum rangkaian acara musyawarah dimulai.

## 2. Jadwal & Agenda
- **08.00 - 09.00**: Registrasi Peserta & Verifikasi Presensi
- **09.00 - 10.30**: Pembukaan & Laporan Pertanggungjawaban Pengurus
- **10.30 - 12.00**: Pemaparan Visi, Misi & Debat Kandidat
- **13.00 - 15.00**: Sesi Pemungutan Suara (E-Voting)
- **15.30 - Selesai**: Rekapitulasi Suara & Penetapan Ketua Terpilih

## 3. Bantuan & Dukungan Teknis
Apabila mengalami kendala akses atau teknis selama pelaksanaan musyawarah, peserta dapat menghubungi panitia pelaksana melalui posko bantuan resmi.`
  },
  "panduan-bakal-calon": {
    title: "Panduan Bakal Calon",
    content: `# Panduan Pendaftaran Bakal Calon

## 1. Persyaratan Kualifikasi
1. Anggota aktif komunitas sekurang-kurangnya 1 (satu) tahun kepengurusan/keanggotaan.
2. Berkelakuan baik dan memiliki komitmen memajukan komunitas.
3. Menyerahkan naskah Visi, Misi, dan Program Kerja Unggulan.
4. Mendapatkan rekomendasi minimal dari 5 (lima) anggota komunitas terverifikasi.

## 2. Dokumen Pendaftaran
- Formulir pendaftaran resmi (online).
- Ringkasan profil dan portofolio kontribusi.
- File presentasi visi misi (format PDF).
- Foto resmi dengan latar belakang biru / putih.

## 3. Tahapan Seleksi & Verifikasi
1. **Pendaftaran Berkas**: Melalui portal resmi pendaftaran bakal calon.
2. **Verifikasi Faktual**: Pemeriksaan berkas dan wawancara oleh Komite Independen.
3. **Penetapan Nomor Urut**: Pengundian nomor urut calon tetap.
4. **Masa Kampanye**: Penyampaian gagasan secara santun dan konstruktif.`
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = (await websiteService.getPublicInformationPage(slug)) || DEFAULT_PAGES_FALLBACK[slug];
    if (!page) {
      return { title: "Halaman Tidak Ditemukan" };
    }
    return {
      title: `${page.title} — Pusat Informasi MUSKOM`,
      description: "Panduan dan tata tertib resmi pelaksanaan Musyawarah KOMITKABE.",
      openGraph: {
        title: `${page.title} — MUSKOM`,
        description: "Panduan resmi pelaksanaan Musyawarah KOMITKABE.",
      },
    };
  } catch (error) {
    return { title: "Pusat Informasi MUSKOM" };
  }
}

export default async function InformationPageDetail({ params }: Props) {
  const { slug } = await params;
  let page = null;
  try {
    page = await websiteService.getPublicInformationPage(slug);
  } catch (err) {
    // If error, fallback to static defaults
  }

  if (!page && DEFAULT_PAGES_FALLBACK[slug]) {
    page = {
      id: slug,
      slug: slug,
      title: DEFAULT_PAGES_FALLBACK[slug].title,
      content: DEFAULT_PAGES_FALLBACK[slug].content,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  if (!page) {
    notFound();
  }

  const homeData = await landingService.getPublicHome();
  const dateStr = page.updated_at || page.created_at;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <ThemeWrapper>
      <main className="min-h-screen pt-28 pb-24 relative">
        {/* Subtle background glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[350px] pointer-events-none bg-glow"
          style={{ filter: "blur(60px)" }}
        />

        <Container className="max-w-4xl relative z-10">
          {/* Back Navigation */}
          <Link
            href="/#informasi"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Pusat Informasi
          </Link>

          {/* Page Header Card */}
          <div className="mb-10 p-8 sm:p-10 rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-light dark:border-slate-800 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase mb-5">
              <FileText className="w-3.5 h-3.5" />
              Pusat Informasi Resmi
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-5">
              {page.title}
            </h1>
            
            {formattedDate && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Terakhir diperbarui: {formattedDate}</span>
              </div>
            )}
          </div>

          {/* Page Content Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-light dark:border-slate-800 shadow-sm leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 mb-6 border-b border-light dark:border-slate-800 pb-3">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4 flex items-center gap-3">
                    <span className="w-1.5 h-6 rounded-full bg-primary inline-block shrink-0" />
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-6 mb-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside ml-6 space-y-2.5 mb-6 text-slate-700 dark:text-slate-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside ml-6 space-y-2.5 mb-6 text-slate-700 dark:text-slate-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed pl-1">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-slate-900 dark:text-white">
                    {children}
                  </strong>
                ),
              }}
            >
              {page.content}
            </ReactMarkdown>
          </div>
        </Container>
      </main>
      <Footer data={homeData ?? null} />
    </ThemeWrapper>
  );
}
