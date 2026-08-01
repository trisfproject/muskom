import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden min-w-0 bg-slate-950">
        {children}
      </main>
    </div>
  );
}
