"use client";

import { Calendar, CheckCircle2, XCircle } from "lucide-react";

interface EventStatus {
  phase: string;
  registration_open: boolean;
  verification_active: boolean;
  voting_session_state: string;
}

export function EventStatusCard({ status }: { status: EventStatus }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" /> Event Status
        </h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wider">
          {status.phase}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Registration</span>
          {status.registration_open ? (
            <span className="inline-flex items-center text-green-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4 mr-1"/> Open</span>
          ) : (
            <span className="inline-flex items-center text-slate-500 text-sm font-medium"><XCircle className="w-4 h-4 mr-1"/> Closed</span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Verification</span>
          {status.verification_active ? (
            <span className="inline-flex items-center text-green-600 text-sm font-medium"><CheckCircle2 className="w-4 h-4 mr-1"/> Active</span>
          ) : (
            <span className="inline-flex items-center text-slate-500 text-sm font-medium"><XCircle className="w-4 h-4 mr-1"/> Inactive</span>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <span className="text-sm font-medium text-slate-700">Voting Session</span>
          <span className={`text-sm font-bold uppercase tracking-wider ${
            status.voting_session_state === 'RUNNING' ? 'text-green-600' :
            status.voting_session_state === 'PAUSED' ? 'text-amber-600' :
            'text-slate-500'
          }`}>
            {status.voting_session_state.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  );
}
