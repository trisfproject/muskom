import { CheckCircle2, Clock, XCircle, PlayCircle, AlertCircle, Calendar } from "lucide-react";

export type EntityState = 
  // Event
  | "DRAFT" | "PUBLISHED" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "CANDIDATE_VERIFICATION" | "CAMPAIGN" | "VOTING" | "COMPLETED" | "ARCHIVED"
  // Participant & Candidate
  | "PENDING" | "APPROVED" | "REJECTED" | "CHECKED_IN" | "VERIFIED" | "CAMPAIGNING"
  // Voting
  | "NOT_STARTED" | "RUNNING" | "PAUSED" | "CLOSED";

interface StateBadgeProps {
  state: string;
}

export function StateBadge({ state }: StateBadgeProps) {
  const getBadgeConfig = (s: string) => {
    switch (s?.toUpperCase()) {
      // Pending / Neutral
      case "DRAFT":
      case "NOT_STARTED":
      case "PENDING":
        return { color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock };
      
      // Active / Running
      case "PUBLISHED":
      case "REGISTRATION_OPEN":
      case "CAMPAIGN":
      case "CAMPAIGNING":
      case "VOTING":
      case "RUNNING":
        return { color: "bg-blue-100 text-blue-700 border-blue-200", icon: PlayCircle };
      
      // Success / Done
      case "COMPLETED":
      case "APPROVED":
      case "VERIFIED":
      case "CHECKED_IN":
        return { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
      
      // Stopped / Blocked
      case "REGISTRATION_CLOSED":
      case "CANDIDATE_VERIFICATION":
      case "PAUSED":
        return { color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertCircle };
      
      // Terminal
      case "REJECTED":
      case "CLOSED":
        return { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle };
      
      case "ARCHIVED":
        return { color: "bg-gray-200 text-gray-800 border-gray-300", icon: Calendar };

      default:
        return { color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock };
    }
  };

  const config = getBadgeConfig(state);
  const Icon = config.icon;
  const label = state?.replace(/_/g, " ") || "UNKNOWN";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.color} capitalize`}>
      <Icon className="w-3 h-3 mr-1" />
      {label.toLowerCase()}
    </span>
  );
}
