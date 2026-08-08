import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/QueryProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { ConfigProvider } from "@/contexts/ConfigContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export async function generateMetadata(): Promise<Metadata> {
  const defaultTitle = "MUSKOM — Portal Musyawarah";
  const defaultDesc = "Portal resmi musyawarah komunitas.";
  
  try {
    const apiUrl = process.env.INTERNAL_API_URL || "http://api:8080/api/v1";
    const res = await fetch(`${apiUrl}/system/config`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      const config = json.data;
      if (config) {
        const identity = config.website_identity;
        const seo = config.seo;
        
        return {
          title: { default: seo?.meta_title || identity?.website_title, template: `%s | ${identity?.community_name}` },
          description: seo?.meta_description || identity?.website_description,
          keywords: seo?.meta_keywords ? seo.meta_keywords.split(',').map((k: string) => k.trim()) : ["musyawarah", "komunitas", "pemilihan", "portal resmi"],
          authors: [{ name: identity?.community_name }],
          robots: "index, follow",
          openGraph: {
            title: seo?.meta_title || identity?.website_title,
            description: seo?.meta_description || identity?.website_description,
            siteName: identity?.community_name,
            images: seo?.opengraph_image ? [seo.opengraph_image] : [],
            type: "website",
          },
          twitter: {
            card: "summary_large_image",
            title: seo?.meta_title || identity?.website_title,
            description: seo?.meta_description || identity?.website_description,
            images: seo?.opengraph_image ? [seo.opengraph_image] : [],
          },
          icons: {
            icon: identity?.favicon_url || "/favicon.ico",
            shortcut: identity?.favicon_url || "/favicon.ico",
            apple: identity?.favicon_url || "/favicon.ico",
          },
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch metadata config during SSR", error);
  }

  // Fallback
  return {
    title: { default: defaultTitle, template: "%s | MUSKOM" },
    description: defaultDesc,
    keywords: ["musyawarah", "komunitas"],
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "MUSKOM",
              url: "https://muskom.id",
              logo: "https://muskom.id/icon.svg",
              description: "Portal resmi musyawarah komunitas."
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ConfigProvider>
          <AuthProvider>
            <NotificationProvider>
              <QueryProvider>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: { background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", color: "#f8fafc" },
                  }}
                />
              </QueryProvider>
            </NotificationProvider>
          </AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  )
}
