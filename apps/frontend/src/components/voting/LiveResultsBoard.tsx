"use client";

import { Users, UserCheck, PieChart } from "lucide-react";
import { SummaryCard } from "@/components/shared/SummaryCard";

interface Result {
  candidate_id: string;
  candidate_name: string;
  total_votes: number;
}

interface Summary {
  total_voters: number;
  votes_cast: number;
  participation_pct: number;
  results: Result[];
}

export function LiveResultsBoard({ summary }: { summary: Summary }) {
  // We expect summary to be fetched via React Query + PollingProvider.
  // For the UI component, we render the raw props.

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard 
          title="Total Registered Voters" 
          value={summary.total_voters} 
          icon={<Users />} 
        />
        <SummaryCard 
          title="Total Votes Cast" 
          value={summary.votes_cast} 
          icon={<UserCheck />} 
        />
        <SummaryCard 
          title="Participation Rate" 
          value={`${summary.participation_pct.toFixed(1)}%`} 
          icon={<PieChart />} 
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Live Standings</h3>
        </div>
        <div className="p-6 space-y-6">
          {summary.results.map((res, index) => {
            const pct = summary.votes_cast > 0 ? (res.total_votes / summary.votes_cast) * 100 : 0;
            return (
              <div key={res.candidate_id}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-500 mr-2">#{index + 1}</span>
                    <span className="text-base font-bold text-slate-900">{res.candidate_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">{res.total_votes}</span>
                    <span className="text-sm text-slate-500 ml-1">votes</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-in-out" 
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          {summary.results.length === 0 && (
             <div className="text-center py-6 text-slate-500">
               No candidate data available.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
