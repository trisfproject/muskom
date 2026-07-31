import { PageHeader } from "@/components/shared/PageHeader";
import { AutomationOverview } from "@/components/automation/AutomationOverview";
import { IntegrationStatus } from "@/components/automation/IntegrationStatus";
import { EventLogViewer } from "@/components/automation/EventLogViewer";

export default function AutomationPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Integration & Automation Platform" 
        description="Monitor event bus dispatches, configure rules, and manage external system integrations." 
      />

      <AutomationOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <IntegrationStatus />
        </div>
        <div className="lg:col-span-2">
          <EventLogViewer />
        </div>
      </div>
    </div>
  );
}
