"use client";

import { Award, Users, UserCheck, Inbox, PieChart, FileX } from "lucide-react";
import { SummaryCard } from "@/components/shared/SummaryCard";

interface OfficialResult {
  total_registered: number;
  approved_participants: number;
  checked_in: number;
  eligible_voters: number;
  total_votes: number;
  abstain: number;
  participation_pct: number;
  winning_candidate?: {
    candidate_id: string;
    name: string;
    number: number;
    total_votes: number;
  };
  candidate_results: {
    candidate_id: string;
    name: string;
    number: number;
    total_votes: number;
  }[];
}

export function OfficialResultBoard({ result }: { result: OfficialResult }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Registered" value={result.total_registered} icon={<Users />} />
        <SummaryCard title="Approved Participants" value={result.approved_participants} icon={<UserCheck />} />
        <SummaryCard title="Checked In (Eligible)" value={result.checked_in} icon={<Inbox />} />
        <SummaryCard title="Votes Cast" value={result.total_votes} icon={<PieChart />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-amber-50">
            <h3 className="text-lg font-medium text-amber-900 flex items-center gap-2">
              <Award className="w-5 h-5" /> Winning Candidate
            </h3>
          </div>
          <div className="p-6 text-center">
            {result.winning_candidate ? (
              <>
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-4">
                  #{result.winning_candidate.number}
                </div>
                <h4 className="text-2xl font-bold text-slate-900">{result.winning_candidate.name}</h4>
                <p className="text-slate-500 mt-2">Secured {result.winning_candidate.total_votes} votes</p>
              </>
            ) : (
              <p className="text-slate-500">No voting data available yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-center">
          <div className="px-6 py-4 border-b border-slate-200">
             <h3 className="text-lg font-medium text-slate-900">Election Metrics</h3>
          </div>
          <div className="p-6 flex flex-col justify-center items-center gap-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-slate-900">{result.participation_pct.toFixed(2)}%</span>
              <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider">Participation Rate</p>
            </div>
            <div className="w-full max-w-xs border-t border-slate-100 my-2"></div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <FileX className="w-5 h-5" />
                <span className="text-2xl font-bold">{result.abstain}</span>
              </div>
              <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider">Abstain (Did not vote)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
