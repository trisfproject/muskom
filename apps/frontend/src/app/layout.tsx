import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/QueryProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: { default: "MUSKOM — Portal Musyawarah Komunitas", template: "%s | MUSKOM" },
  description: "Platform resmi musyawarah komunitas. Transparan, aman, dan dapat diandalkan oleh seluruh anggota.",
  keywords: ["musyawarah", "komunitas", "pemilihan", "portal resmi"],
  authors: [{ name: "MUSKOM" }],
  robots: "index, follow",
  openGraph: {
    title: "MUSKOM — Portal Musyawarah Komunitas",
    description: "Platform resmi musyawarah komunitas. Transparan, aman, dan dapat diandalkan oleh seluruh anggota.",
    url: "https://muskom.id",
    siteName: "MUSKOM",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MUSKOM — Portal Musyawarah Komunitas",
    description: "Platform resmi musyawarah komunitas. Transparan, aman, dan dapat diandalkan oleh seluruh anggota.",
    images: ["/og-image.jpg"],
  },
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
      </body>
    </html>
  )
}
