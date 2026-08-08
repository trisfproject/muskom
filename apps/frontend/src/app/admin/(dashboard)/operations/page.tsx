import { redirect } from "next/navigation";

export default function OperationalDashboardPage() {
  // Operational dashboard has been consolidated into the main dashboard.
  redirect("/admin/dashboard");
}
