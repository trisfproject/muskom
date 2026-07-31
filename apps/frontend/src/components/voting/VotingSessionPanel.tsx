"use client";

import { Play, Pause, Square, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function VotingSessionPanel({ status }: { status: string }) {
  const [sessionState, setSessionState] = useState(status || "NOT_STARTED");
  const [isLoading, setIsLoading] = useState(false);

  const updateSession = async (action: string) => {
    setIsLoading(true);
    // Mocking API call to POST /api/v1/voting/session/:action
    setTimeout(() => {
      if (action === 'open' || action === 'resume') setSessionState("RUNNING");
      if (action === 'pause') setSessionState("PAUSED");
      if (action === 'close') setSessionState("CLOSED");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Voting Session Control</h3>
          <p className="text-sm text-slate-500">Manage the lifecycle of the active election.</p>
        </div>
        <div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
            sessionState === 'RUNNING' ? 'bg-green-50 text-green-700 border-green-200' :
            sessionState === 'PAUSED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            sessionState === 'CLOSED' ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {sessionState.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        {sessionState === "NOT_STARTED" && (
          <div className="text-center py-8">
            <p className="text-slate-600 mb-4">The voting session has not been initiated for this event.</p>
            <button 
              onClick={() => updateSession('open')}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Play className="w-5 h-5 mr-2" /> Open Voting Session
            </button>
          </div>
        )}

        {sessionState === "RUNNING" && (
          <div className="flex gap-4 justify-center py-8">
            <button 
              onClick={() => updateSession('pause')}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 border border-amber-200 rounded-md font-medium hover:bg-amber-200 disabled:opacity-50"
            >
              <Pause className="w-5 h-5 mr-2" /> Pause Voting
            </button>
            <button 
              onClick={() => {
                if(window.confirm("Are you sure you want to completely CLOSE this voting session? This is irreversible.")) {
                  updateSession('close');
                }
              }}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
            >
              <Square className="w-5 h-5 mr-2" /> Close Voting
            </button>
          </div>
        )}

        {sessionState === "PAUSED" && (
          <div className="flex gap-4 justify-center py-8">
            <button 
              onClick={() => updateSession('resume')}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="w-5 h-5 mr-2" /> Resume Voting
            </button>
          </div>
        )}

        {sessionState === "CLOSED" && (
          <div className="text-center py-8 flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-slate-300 mb-4" />
            <h4 className="text-lg font-medium text-slate-900">Voting is Permanently Closed</h4>
            <p className="text-slate-500 mt-1">No further votes can be cast for this event.</p>
          </div>
        )}
      </div>
    </div>
  );
}
