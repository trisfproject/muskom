import { Zap, Activity, Clock, ShieldAlert } from "lucide-react";
import { SummaryCard } from "../shared/SummaryCard";

export function AutomationOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <SummaryCard 
        title="Total Rules" 
        value={12} 
        icon={<Zap />} 
      />
      <SummaryCard 
        title="Events Dispatched (24h)" 
        value={1245} 
        icon={<Activity />} 
      />
      <SummaryCard 
        title="Avg. Duration" 
        value="45ms" 
        icon={<Clock />} 
      />
      <SummaryCard 
        title="Failed Dispatches" 
        value={3} 
        icon={<ShieldAlert />} 
      />
    </div>
  );
}
