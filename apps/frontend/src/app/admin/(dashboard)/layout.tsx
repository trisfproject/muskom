import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";

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
    <AdminLayoutWrapper>
      {children}
    </AdminLayoutWrapper>
  );
}
