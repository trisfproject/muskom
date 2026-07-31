import { AuditEntry } from "@/services/audit/types";
import { format } from "date-fns";
import { Activity } from "lucide-react";

interface AuditTimelineProps {
  entries: AuditEntry[];
}

export function AuditTimeline({ entries }: AuditTimelineProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500 italic">No activity recorded yet.</p>;
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {entries.map((entry, idx) => (
          <li key={entry.id}>
            <div className="relative pb-8">
              {idx !== entries.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center ring-8 ring-white">
                    <Activity className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-900">{entry.action}</span>{" "}
                      on {entry.module} by{" "}
                      <span className="font-medium text-slate-900">{entry.actor_id || "System"}</span>
                    </p>
                    {entry.reason && (
                      <p className="mt-1 text-sm text-slate-600 italic">&quot;{entry.reason}&quot;</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-slate-500">
                    <time dateTime={entry.created_at}>{format(new Date(entry.created_at), "MMM d, HH:mm")}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
