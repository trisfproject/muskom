import { redirect } from 'next/navigation';

export default async function PublicCheckinPage({
  params,
}: {
  params: Promise<{ regNum: string }>;
}) {
  const { regNum } = await params;
  
  // Redirect to admin checkin page with the scanned QR data
  redirect(`/admin/checkin?scan=${regNum}`);
}
