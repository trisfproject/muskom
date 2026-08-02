import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/QueryProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { ConfigProvider } from "@/contexts/ConfigContext"
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const res = await fetch(`${apiUrl}/system/config`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      const config = json.data;
      if (config && config.website_identity) {
        return {
          title: { default: config.website_identity.website_title, template: `%s | ${config.website_identity.community_name}` },
          description: config.website_identity.website_description,
          keywords: ["musyawarah", "komunitas", "pemilihan", "portal resmi"],
          authors: [{ name: config.website_identity.community_name }],
          robots: "index, follow",
          openGraph: {
            title: config.website_identity.website_title,
            description: config.website_identity.website_description,
            siteName: config.website_identity.community_name,
            type: "website",
          },
          twitter: {
            card: "summary_large_image",
            title: config.website_identity.website_title,
            description: config.website_identity.website_description,
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
      <body>
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
        <ConfigProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  style: { background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", color: "#f8fafc" },
                }}
              />
            </QueryProvider>
          </AuthProvider>
        </ConfigProvider>
      </body>
    </html>
  )
}
