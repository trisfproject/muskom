import { PageHeader } from "@/components/shared/PageHeader";
import { NotificationTemplatesPanel } from "@/components/notification/NotificationTemplatesPanel";
import { NotificationQueueTable } from "@/components/notification/NotificationQueueTable";
import { NotificationHistoryTable } from "@/components/notification/NotificationHistoryTable";

export default function NotificationsPage() {
  const mockTemplates = [
    {
      id: "tpl-1",
      name: "Participant Approved",
      channel: "EMAIL",
      subject: "Welcome to MUSKOM",
      body: "Dear {{name}}, your registration has been approved. Your ID is {{reg_id}}."
    },
    {
      id: "tpl-2",
      name: "OTP Verification",
      channel: "WHATSAPP",
      body: "Your MUSKOM verification code is {{code}}."
    },
    {
      id: "tpl-3",
      name: "Voting Reminder",
      channel: "TELEGRAM",
      body: "Voting is now open! Please cast your vote before {{closing_time}}."
    }
  ];

  const mockJobs = [
    {
      id: "job-1",
      recipient: "john@example.com",
      channel: "EMAIL",
      status: "PROCESSING",
      created_at: "2026-07-31T10:00:00.000Z"
    },
    {
      id: "job-2",
      recipient: "+6281234567890",
      channel: "WHATSAPP",
      status: "PENDING",
      created_at: "2026-07-31T09:00:00.000Z"
    }
  ];

  const mockHistory = [
    {
      id: "hist-1",
      recipient: "jane@example.com",
      channel: "EMAIL",
      status: "SENT",
      sent_at: "2026-07-31T08:00:00.000Z"
    },
    {
      id: "hist-2",
      recipient: "+6289876543210",
      channel: "WHATSAPP",
      status: "FAILED",
      sent_at: "2026-07-31T07:00:00.000Z",
      error_message: "Invalid phone number format."
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Notification Engine" 
        description="Manage communication templates, monitor active queues, and review delivery history." 
      />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Templates</h2>
          <NotificationTemplatesPanel templates={mockTemplates} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
          <div>
            <NotificationQueueTable jobs={mockJobs} />
          </div>
          <div>
            <NotificationHistoryTable history={mockHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
