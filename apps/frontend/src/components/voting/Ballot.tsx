"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export interface Candidate {
  id: string;
  number: number;
  name: string;
  photo_url: string;
  vision: string;
  mission: string;
}

export function Ballot({ candidates, onVote }: { candidates: Candidate[], onVote: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selectedId) return;
    if (window.confirm("Are you sure you want to cast your vote for this candidate? This action is irreversible.")) {
      onVote(selectedId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-900">Official Ballot</h2>
        <p className="text-slate-600 mt-2">Select one candidate below and cast your vote.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {candidates.map((c) => (
          <div 
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`relative rounded-xl border-2 cursor-pointer overflow-hidden transition-all duration-200 ${
              selectedId === c.id 
                ? 'border-blue-600 shadow-md ring-4 ring-blue-600/10' 
                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            {selectedId === c.id && (
              <div className="absolute top-4 right-4 z-10 bg-white rounded-full">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            )}
            
            <div className="aspect-[4/3] bg-slate-100 relative">
              {c.photo_url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No Photo
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm font-bold text-slate-900">
                # {c.number}
              </div>
            </div>
            
            <div className="p-6 bg-white">
              <h3 className="text-xl font-bold text-slate-900 mb-4">{c.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Vision</h4>
                  <p className="text-sm text-slate-700 line-clamp-2">{c.vision}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Mission</h4>
                  <p className="text-sm text-slate-700 line-clamp-2">{c.mission}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedId}
          className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Cast My Vote
        </button>
      </div>
    </div>
  );
}
