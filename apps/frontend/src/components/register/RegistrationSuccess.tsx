import Link from 'next/link';
import { CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicRegistrationResponse } from '@/types/registration';
import { MusyawarahEvent } from '@/types/event';

interface RegistrationSuccessProps {
  data: PublicRegistrationResponse;
  event: MusyawarahEvent;
}

export function RegistrationSuccess({ data, event }: RegistrationSuccessProps) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-2xl mx-auto">
      <div className="mx-auto bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Registration Successful</h2>
      <p className="text-lg text-slate-600 mb-8">
        Your registration for <strong>{event.name}</strong> has been received and is pending verification.
      </p>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-2">Your Registration Code</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl font-mono font-bold text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            {data.registration_code}
          </span>
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full bg-white text-slate-500 hover:text-slate-900"
            onClick={() => navigator.clipboard.writeText(data.registration_code)}
            title="Copy Code"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Please save this code securely. You will need it to check your status and access the voting portal.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">What happens next?</h3>
        <ul className="text-slate-600 text-sm text-left max-w-md mx-auto space-y-2 list-disc list-inside">
          <li>The administrative committee will review your submission.</li>
          <li>You will receive an email notification regarding your status.</li>
          <li>Once approved, you will be granted access to the voting system.</li>
        </ul>
      </div>

      <div className="mt-10">
        <Link href="/">
          <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-8 py-6">
            Return to Landing Page
          </Button>
        </Link>
      </div>
    </div>
  );
}
