import { AuditEntry } from "@/services/audit/types";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { format } from "date-fns";

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: AuditEntry | null;
}

export function AuditDrawer({ isOpen, onClose, data }: AuditDrawerProps) {
  if (!data) return null;

  return (
    <DetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Record Detail"
      description={`Record ID: ${data.id}`}
    >
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Context</h3>
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <div>
              <p className="text-xs text-slate-500 font-medium">Module</p>
              <p className="text-sm text-slate-900 capitalize">{data.module}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Action</p>
              <p className="text-sm text-slate-900 font-mono bg-slate-200 inline-block px-1 rounded">{data.action}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Timestamp</p>
              <p className="text-sm text-slate-900">{format(new Date(data.created_at), "dd MMM yyyy, HH:mm:ss")}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Actor</h3>
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <div>
              <p className="text-xs text-slate-500 font-medium">Actor ID</p>
              <p className="text-sm font-mono text-slate-700">{data.actor_id || "System"}</p>
            </div>
            {data.actor_role && (
              <div>
                <p className="text-xs text-slate-500 font-medium">Actor Role</p>
                <p className="text-sm text-slate-900">{data.actor_role}</p>
              </div>
            )}
            {data.ip_address && (
              <div>
                <p className="text-xs text-slate-500 font-medium">IP Address</p>
                <p className="text-sm font-mono text-slate-700">{data.ip_address}</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Target Entity</h3>
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <div>
              <p className="text-xs text-slate-500 font-medium">Entity Type</p>
              <p className="text-sm text-slate-900">{data.entity}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Entity ID</p>
              <p className="text-sm font-mono text-slate-700">{data.entity_id}</p>
            </div>
          </div>
        </section>

        {data.reason && (
          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Reason</h3>
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
              <p className="text-sm text-slate-900 italic">{data.reason}</p>
            </div>
          </section>
        )}

        <section>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Metadata Payload</h3>
          <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs text-green-400 font-mono">
              {data.metadata ? JSON.stringify(data.metadata, null, 2) : "No metadata"}
            </pre>
          </div>
        </section>
      </div>
    </DetailDrawer>
  );
}
