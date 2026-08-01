"use client"

import { HomeResponse } from "@/types/landing"
import { ChevronDown } from "lucide-react"
import { SlideUp } from "@/components/landing/Shared"

// FAQ
// ─────────────────────────────────────────────────────────────
export function FAQ({ data }: { data: HomeResponse | null }) {
  const faqs = data?.faq || [];
  if (!faqs.length) return null;

  return (
    <section id="faq" className="pg-bg-paper border-t pg-border">
      <div className="container-landing py-24 lg:py-32">
        <SlideUp className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Tanya Jawab</p>
          <h2 className="text-3xl sm:text-4xl font-black pg-text tracking-tight mb-4">Pertanyaan Umum (FAQ)</h2>
          <p className="pg-muted text-lg leading-relaxed">Jawaban cepat untuk pertanyaan yang sering diajukan mengenai pelaksanaan musyawarah.</p>
        </SlideUp>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <SlideUp key={i} delay={i * 0.1}>
              <details className="group pg-card-i rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold pg-text">
                  {faq.question}
                  <span className="transition group-open:-rotate-180">
                    <ChevronDown className="w-5 h-5 pg-faint" />
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-0 text-sm pg-muted leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  )
}
