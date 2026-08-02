import React, { useEffect, useState } from 'react';
import { auditService, AuditLog } from '@/services/admin/audit';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EntityTimelineProps {
  entity: string;
  entityId: string;
}

export function EntityTimeline({ entity, entityId }: EntityTimelineProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await auditService.listLogs({ search: entityId }); // simplistic filtering based on existing backend
        // Filter by exact entity and entity_id just in case
        const exactLogs = res.data.filter(l => l.entity === entity && l.entity_id === entityId);
        setLogs(exactLogs);
      } catch (err: any) {
        toast.error('Gagal mengambil history');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [entity, entityId]);

  if (loading) {
    return <div className="text-sm text-slate-400">Loading history...</div>;
  }

  if (logs.length === 0) {
    return <div className="text-sm text-slate-500">Belum ada riwayat aktivitas.</div>;
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-4 items-start relative pb-4">
          <div className="absolute top-6 bottom-0 left-2 w-px bg-slate-800 -ml-px"></div>
          <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-indigo-500 relative z-10 shrink-0 mt-1"></div>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-200">
              {log.action}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Oleh: {log.actor_name || 'Sistem'} ({log.actor_role || '-'})
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss')}
            </div>
            {log.reason && (
              <div className="mt-2 text-xs p-2 bg-slate-900 rounded border border-slate-800 text-slate-300">
                {log.reason}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
