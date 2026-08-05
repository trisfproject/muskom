"use client";

import { useSystemConfig } from "@/contexts/ConfigContext";
import { HomeResponse } from "@/types/landing";
import { ArrowUp, ArrowRight, ShieldCheck, Mail, MapPin, FileText, Phone } from "lucide-react";
import Link from "next/link";

export function Footer({ data }: { data: HomeResponse | null }) {
  const { config } = useSystemConfig();
  const identity = config?.website_identity;
  const contact = config?.contact;

  if (!data) return null;
  if (config?.feature_flags && !config.feature_flags.show_footer) {
    return null;
  }

  const orgName = data?.footer?.organization_name || identity?.community_name || "MUSKOM";
  const eventLabel = data?.event?.name || identity?.community_name || "MUSKOM 2026";
  const desc = data?.footer?.description || identity?.website_description || "Portal resmi Musyawarah. Membangun proses pemilihan yang transparan, profesional, dan dapat dipercaya oleh seluruh anggota komunitas.";
  const copyright = data.footer?.copyright || `© ${new Date().getFullYear()} ${orgName}. Seluruh hak cipta dilindungi.`;
  const badge = data.footer?.official_badge || "OFFICIAL PORTAL";
  const tagline = data.footer?.tagline || "Dibangun untuk kemajuan bersama.";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const officialDocs = [
    { title: "Tata Tertib Musyawarah", href: "/informasi/tata-tertib-musyawarah" },
    { title: "Tata Cara Pemilihan", href: "/informasi/tata-cara-pemilihan" },
    { title: "Panduan Peserta", href: "/informasi/panduan-peserta" },
    { title: "Panduan Bakal Calon", href: "/informasi/panduan-bakal-calon" },
  ];

  return (
    <footer className="relative bg-white/30 dark:bg-slate-950/30 backdrop-blur-3xl border-t border-white/30 dark:border-slate-800/40 overflow-hidden transition-colors mt-auto shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
      {/* ── Top Atmospheric Accent Line ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* ── Background Subtle Glow ── */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none bg-glow opacity-50"
        style={{ filter: "blur(70px)" }}
      />
      <div
        className="absolute top-0 left-0 w-[350px] h-[250px] pointer-events-none bg-glow opacity-30"
        style={{ filter: "blur(60px)" }}
      />

      <div className="container-landing py-12 md:py-16 lg:py-20 relative z-10 pb-24 md:pb-16 lg:pb-20">
        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-10 md:gap-8 lg:gap-12 mb-10 md:mb-14">
          {/* Column 1: Brand Presentation */}
          <div className="md:col-span-1 lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {orgName}
                </span>
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 border border-primary/20 text-primary">
                  2026
                </span>
              </div>

              {/* Brand Tagline */}
              <p className="text-sm font-semibold text-primary mb-3">
                Together We Shape the Future
              </p>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mb-6 whitespace-pre-line">
                {desc}
              </p>
            </div>

            {/* Trust Assurance Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-fit">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Pemilihan Transparan & Akuntabel
              </span>
            </div>
          </div>

          {/* Column 2: Official Documents & Direct Access */}
          <div className="md:col-span-1 lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 md:mb-5 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Dokumen & Panduan Resmi
            </h4>

            <ul className="space-y-3">
              {officialDocs.map((doc) => (
                <li key={doc.href}>
                  <Link
                    href={doc.href}
                    className="group inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    <span>{doc.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Secretariat & Contact Info */}
          <div className="md:col-span-1 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 md:mb-5 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Sekretariat Panitia
            </h4>

            <div className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                FORMATUR {eventLabel}
              </p>

              <div className="flex flex-col gap-2.5 mt-4">
                {contact?.email && (
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">{contact.email}</a>
                  </div>
                )}

                {contact?.whatsapp && (
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{contact.whatsapp}</a>
                  </div>
                )}

                {contact?.secretariat && (
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{contact.secretariat}</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 dark:bg-primary/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-primary tracking-widest uppercase">
                    {badge}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Community Closing Message Strip ── */}
        <div className="mb-8 md:mb-10 p-4 md:p-5 lg:p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-primary/10 items-center justify-center text-primary shrink-0 font-black text-sm">
              M
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Musyawarah Komunitas Berintegritas & Inklusif
              </p>
              {tagline && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  &quot;{tagline}&quot;
                </p>
              )}
            </div>
          </div>

          <button
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer group shadow-2xs"
          >
            <span>Kembali ke Atas</span>
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* ── Bottom Bar: Copyright & Attribution ── */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8">
            <p suppressHydrationWarning>{copyright}</p>
          </div>

          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <span>Asas LUBER JURDIL</span>
            <span>•</span>
            <span>Platform E-Voting Digital</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
