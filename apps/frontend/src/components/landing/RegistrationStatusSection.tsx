import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, CheckCircle2, XCircle } from 'lucide-react';
import { MusyawarahEvent } from '@/types/event';

interface RegistrationStatusSectionProps {
  event: MusyawarahEvent;
}

export function RegistrationStatusSection({ event }: RegistrationStatusSectionProps) {
  const now = new Date();
  
  // Participant Status
  const partStart = event.registration_start ? new Date(event.registration_start) : null;
  const partEnd = event.registration_end ? new Date(event.registration_end) : null;
  const isPartOpen = partStart && partEnd && now >= partStart && now <= partEnd;
  
  // Candidate Status
  const candStart = event.candidate_registration_start ? new Date(event.candidate_registration_start) : null;
  const candEnd = event.candidate_registration_end ? new Date(event.candidate_registration_end) : null;
  const isCandOpen = event.allow_candidate_registration && candStart && candEnd && now >= candStart && now <= candEnd;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Status</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Check the current registration phases and secure your spot in the upcoming Musyawarah.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Participant Card */}
          <Card className={`border-2 ${isPartOpen ? 'border-blue-500 shadow-blue-100 shadow-xl' : 'border-slate-200'}`}>
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-xl ${isPartOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Users className="h-8 w-8" />
                </div>
                {isPartOpen ? (
                  <span className="flex items-center text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Open
                  </span>
                ) : (
                  <span className="flex items-center text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <XCircle className="w-4 h-4 mr-1.5" /> Closed
                  </span>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Participant Registration</h3>
              <p className="text-slate-500 mb-6 min-h-[48px]">
                Register to attend, observe, and vote during the main Musyawarah event.
              </p>

              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Opens</span>
                  <span className="font-medium text-slate-900">{partStart ? partStart.toLocaleDateString() : 'TBA'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Closes</span>
                  <span className="font-medium text-slate-900">{partEnd ? partEnd.toLocaleDateString() : 'TBA'}</span>
                </div>
                {event.max_participants && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Total Quota</span>
                    <span className="font-medium text-slate-900">{event.max_participants}</span>
                  </div>
                )}
              </div>

              {isPartOpen ? (
                <Link href="/register" className="block w-full">
                  <Button className="w-full px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white">
                    Register Now
                  </Button>
                </Link>
              ) : (
                <Button className="w-full px-8 py-3 text-lg bg-slate-100 text-slate-400 cursor-not-allowed" disabled>
                  Registration Closed
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Candidate Card */}
          <Card className={`border-2 ${isCandOpen ? 'border-purple-500 shadow-purple-100 shadow-xl' : 'border-slate-200'}`}>
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-xl ${isCandOpen ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                  <UserPlus className="h-8 w-8" />
                </div>
                {isCandOpen ? (
                  <span className="flex items-center text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Open
                  </span>
                ) : (
                  <span className="flex items-center text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <XCircle className="w-4 h-4 mr-1.5" /> Closed
                  </span>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Candidate Registration</h3>
              <p className="text-slate-500 mb-6 min-h-[48px]">
                Submit your profile, vision, and mission to run as an official candidate.
              </p>

              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Opens</span>
                  <span className="font-medium text-slate-900">{candStart ? candStart.toLocaleDateString() : 'TBA'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Closes</span>
                  <span className="font-medium text-slate-900">{candEnd ? candEnd.toLocaleDateString() : 'TBA'}</span>
                </div>
                {!event.allow_candidate_registration && (
                  <div className="flex justify-between py-2 border-b border-slate-100 text-red-500">
                    <span className="col-span-2">Candidate registration is disabled by admin.</span>
                  </div>
                )}
              </div>

              {isCandOpen ? (
                <Link href="/register-candidate" className="block w-full">
                  <Button className="w-full px-8 py-3 text-lg bg-purple-600 hover:bg-purple-700 text-white">
                    Submit Candidacy
                  </Button>
                </Link>
              ) : (
                <Button className="w-full px-8 py-3 text-lg bg-slate-100 text-slate-400 cursor-not-allowed" disabled>
                  Registration Closed
                </Button>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
}
