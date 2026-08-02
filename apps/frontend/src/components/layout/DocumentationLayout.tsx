"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronRight, FileText, Calendar, Menu, X } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/layout";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface DocumentationLayoutProps {
  title: string;
  content: string;
  lastUpdated?: string;
  backLink?: {
    href: string;
    label: string;
  };
}

// Simple slugifier for headings
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function DocumentationLayout({ title, content, lastUpdated, backLink }: DocumentationLayoutProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  // Extract headings (H2 and H3)
  useEffect(() => {
    const lines = content.split("\n");
    const extractedHeadings: Heading[] = [];
    
    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const text = match[2].trim();
        // Remove markdown formatting from text if present (simple regex)
        const cleanText = text.replace(/[*_~`]/g, "");
        extractedHeadings.push({
          level: match[1].length,
          text: cleanText,
          id: generateSlug(cleanText)
        });
      }
    }
    setHeadings(extractedHeadings);
  }, [content]);

  // Handle active heading intersection observer
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const hasToc = headings.length >= 2;

  // Render Table of Contents
  const TOC = () => (
    <nav className="space-y-1">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          onClick={() => setIsMobileTocOpen(false)}
          className={`block py-1.5 transition-colors ${
            heading.level === 3 ? "pl-4 text-xs" : "text-sm font-medium"
          } ${
            activeId === heading.id
              ? "text-primary"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen pt-28 pb-24 relative">
      {/* Subtle background glow */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[350px] pointer-events-none bg-glow"
        style={{ filter: "blur(60px)" }}
      />

      <Container className="max-w-[1200px] relative z-10">
        
        {/* Breadcrumb / Back Link */}
        {backLink && (
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8 group"
          >
            <ChevronRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
            {backLink.label}
          </Link>
        )}

        <div className={`grid grid-cols-1 ${hasToc ? 'lg:grid-cols-[1fr_260px] xl:grid-cols-[1fr_280px]' : ''} gap-12 items-start`}>
          
          {/* Main Reading Surface */}
          <main className="order-2 lg:order-1 min-w-0">
            <article className="w-full rounded-3xl bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
              
              {/* Document Header (Inside surface) */}
              <header className="px-6 sm:px-10 md:px-14 pt-12 md:pt-16 pb-8 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase mb-6">
                  <FileText className="w-3.5 h-3.5" />
                  Dokumen Resmi
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
                  {title}
                </h1>
                
                {lastUpdated && (
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Terakhir diperbarui: {lastUpdated}</span>
                  </div>
                )}
              </header>

              {/* Document Content */}
              <div className="px-6 sm:px-10 md:px-14 py-10 md:py-14 max-w-[820px] mx-auto">
                <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: () => null, // We hide H1 because it's rendered in the Document Header
                      h2: ({ children }) => {
                        // Extract text directly or recursively if children is complex
                        const extractText = (node: any): string => {
                           if (typeof node === "string") return node;
                           if (Array.isArray(node)) return node.map(extractText).join("");
                           if (node?.props?.children) return extractText(node.props.children);
                           return "";
                        };
                        const text = extractText(children);
                        const id = generateSlug(text);
                        return (
                          <h2 id={id} className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-14 mb-6 flex items-center gap-3 scroll-mt-32">
                            <span className="w-1.5 h-6 sm:h-8 rounded-full bg-primary inline-block shrink-0" />
                            {children}
                          </h2>
                        );
                      },
                      h3: ({ children }) => {
                        const extractText = (node: any): string => {
                           if (typeof node === "string") return node;
                           if (Array.isArray(node)) return node.map(extractText).join("");
                           if (node?.props?.children) return extractText(node.props.children);
                           return "";
                        };
                        const text = extractText(children);
                        const id = generateSlug(text);
                        return (
                          <h3 id={id} className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-10 mb-4 scroll-mt-32">
                            {children}
                          </h3>
                        );
                      },
                      p: ({ children }) => (
                        <p className="text-[17px] sm:text-[18px] text-slate-600 dark:text-slate-300 leading-[1.8] mb-6">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-outside ml-6 space-y-3 mb-8 text-[17px] sm:text-[18px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-outside ml-6 space-y-3 mb-8 text-[17px] sm:text-[18px] text-slate-600 dark:text-slate-300 leading-relaxed marker:font-semibold marker:text-slate-400">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="pl-1.5">
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
                    {content}
                  </ReactMarkdown>
                </div>
              </div>

            </article>
          </main>

          {/* Desktop & Mobile TOC Sidebar */}
          {hasToc && (
            <aside className="order-1 lg:order-2 lg:sticky lg:top-32 lg:block">
              
              {/* Mobile TOC Toggle */}
              <div className="lg:hidden mb-6">
                <button 
                  onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Daftar Isi</span>
                  {isMobileTocOpen ? <X className="w-4 h-4 text-slate-400" /> : <Menu className="w-4 h-4 text-slate-400" />}
                </button>
                
                {isMobileTocOpen && (
                  <div className="mt-2 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 shadow-sm">
                    <TOC />
                  </div>
                )}
              </div>

              {/* Desktop TOC */}
              <div className="hidden lg:block">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">
                  Daftar Isi
                </h4>
                <div className="pl-1 border-l-2 border-slate-100 dark:border-slate-800/60">
                  <TOC />
                </div>
              </div>
            </aside>
          )}

        </div>
      </Container>
    </div>
  );
}
