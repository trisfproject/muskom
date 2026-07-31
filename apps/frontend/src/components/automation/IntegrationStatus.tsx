import { Mail, MessageSquare, Send, Webhook, FileSpreadsheet, Download, CheckCircle2, XCircle } from "lucide-react";

export function IntegrationStatus() {
  const providers = [
    { name: "EmailProvider", icon: Mail, status: "HEALTHY", description: "SMTP Server (SendGrid)" },
    { name: "WhatsAppProvider", icon: MessageSquare, status: "HEALTHY", description: "Twilio Business API" },
    { name: "TelegramProvider", icon: Send, status: "DISABLED", description: "Telegram Bot API" },
    { name: "WebhookProvider", icon: Webhook, status: "HEALTHY", description: "Generic HTTPS Push" },
    { name: "GoogleSheetsProvider", icon: FileSpreadsheet, status: "ERROR", description: "OAuth2 Token Expired" },
    { name: "ExportProvider", icon: Download, status: "HEALTHY", description: "Internal CSV/PDF Engine" },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-medium text-slate-900">Integration Providers</h3>
        <p className="text-sm text-slate-500">Real-time health status of external system connectors.</p>
      </div>
      <div className="divide-y divide-slate-200">
        {providers.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.name} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.description}</p>
                </div>
              </div>
              <div>
                {p.status === "HEALTHY" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                  </span>
                ) : p.status === "DISABLED" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    Disabled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    <XCircle className="w-3.5 h-3.5" /> Error
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
