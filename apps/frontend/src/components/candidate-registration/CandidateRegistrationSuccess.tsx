import Link from 'next/link';
import { CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CandidateRegistrationResponse } from '@/types/candidate-registration';
import { MusyawarahEvent } from '@/types/event';

interface CandidateRegistrationSuccessProps {
  data: CandidateRegistrationResponse;
  event: MusyawarahEvent;
  candidateName: string;
}

export function CandidateRegistrationSuccess({ data, event, candidateName }: CandidateRegistrationSuccessProps) {
  return (
    <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      
      <div className="mx-auto bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Candidate Application Submitted</h2>
      <p className="text-lg text-slate-600 mb-8">
        Thank you, <strong>{candidateName}</strong>. Your candidate application for <strong>{event.name}</strong> has been successfully received.
      </p>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-2">Your Candidate Registration Number</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl font-mono font-bold text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm truncate max-w-[280px]">
            {data.candidate_code}
          </span>
          <Button 
            className="rounded-full bg-white text-slate-500 hover:text-slate-900 flex-shrink-0"
            onClick={() => navigator.clipboard.writeText(data.candidate_code)}
            title="Copy Code"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8 text-left">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          Current Status: Pending Verification
        </h3>
        <p className="text-blue-800 text-sm">
          The administrative committee will thoroughly review your submission and attached documents. You will be notified of your approval status via email.
        </p>
      </div>

      <div className="mt-8">
        <Link href="/">
          <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-8 py-6">
            Return to Landing Page
          </Button>
        </Link>
      </div>
    </div>
  );
}
