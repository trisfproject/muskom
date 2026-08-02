import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata = {
  title: "Admin Portal — MUSKOM",
  description: "Musyawarah KOMITKABE CMS & Administration Portal",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)] text-slate-100 antialiased">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg)] h-screen overflow-hidden">
        <AdminHeader />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
