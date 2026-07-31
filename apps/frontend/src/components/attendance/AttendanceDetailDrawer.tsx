"use client";

import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AttendanceDetail } from "@/services/attendance/types";
import { useUndoCheckIn } from "@/services/attendance/mutations";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface AttendanceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: AttendanceDetail | null;
}

export function AttendanceDetailDrawer({ isOpen, onClose, data }: AttendanceDetailDrawerProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [undoReason, setUndoReason] = useState("");
  const undoMutation = useUndoCheckIn();

  if (!data) return null;

  const handleUndo = async () => {
    if (!undoReason.trim()) {
      toast.error("Undo reason is required");
      return;
    }

    try {
      await undoMutation.mutateAsync({ checkInId: data.id, notes: undoReason });
      toast.success("Check-in undone successfully");
      setIsConfirmOpen(false);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to undo check-in");
    }
  };

  return (
    <>
      <DetailDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Attendance Detail"
        description="View participant profile and attendance history"
      >
        <div className="space-y-6">
          {/* Profile Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Participant Profile</h3>
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">Full Name</p>
                <p className="text-sm text-slate-900">{data.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Institution/Company</p>
                <p className="text-sm text-slate-900">{data.institution}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Email</p>
                <p className="text-sm text-slate-900">{data.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Registration ID</p>
                <p className="text-sm font-mono text-slate-700">{data.registration_id}</p>
              </div>
            </div>
          </section>

          {/* Attendance Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Attendance Status</h3>
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                <StatusBadge status="PRESENT" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Checked In At</p>
                <p className="text-sm text-slate-900">
                  {format(new Date(data.checked_in_at), "dd MMM yyyy, HH:mm:ss")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Checked In By (Operator)</p>
                <p className="text-sm font-mono text-slate-700">{data.checked_in_by}</p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="w-full flex justify-center items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <AlertCircle className="w-4 h-4" /> Undo Check-in
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">
              Requires Super Admin or Committee privileges. This action creates an audit log.
            </p>
          </section>
        </div>
      </DetailDrawer>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Undo Check-in"
        description={
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-600">
              Are you sure you want to undo the check-in for <strong>{data.full_name}</strong>?
              This action is immutable and will be recorded in the audit logs.
            </p>
            <div className="space-y-1">
              <label htmlFor="undo-reason" className="text-xs font-medium text-slate-700">Reason for Undo</label>
              <textarea
                id="undo-reason"
                value={undoReason}
                onChange={(e) => setUndoReason(e.target.value)}
                className="w-full h-24 p-2 border border-slate-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm text-slate-900"
                placeholder="Required: E.g., Accidental check-in, wrong badge..."
              />
            </div>
          </div>
        }
        confirmText="Confirm Undo"
        onConfirm={handleUndo}
        onCancel={() => {
          setIsConfirmOpen(false);
          setUndoReason("");
        }}
        isLoading={undoMutation.isPending}
      />
    </>
  );
}
