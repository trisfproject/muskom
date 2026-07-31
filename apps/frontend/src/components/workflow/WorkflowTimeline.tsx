import { CheckCircle2, Circle } from "lucide-react";

export interface WorkflowStep {
  state: string;
  label: string;
  description?: string;
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentState: string;
}

export function WorkflowTimeline({ steps, currentState }: WorkflowTimelineProps) {
  // Find the index of the current state to determine past/future
  const currentIndex = steps.findIndex((s) => s.state === currentState);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => {
          const isComplete = currentIndex > stepIdx;
          const isCurrent = currentIndex === stepIdx;

          return (
            <li key={step.state} className={`relative ${stepIdx !== steps.length - 1 ? "pb-10" : ""}`}>
              {stepIdx !== steps.length - 1 ? (
                <div
                  className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${
                    isComplete ? "bg-blue-600" : "bg-slate-200"
                  }`}
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start group">
                <span className="flex h-9 items-center">
                  {isComplete ? (
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 group-hover:bg-blue-800">
                      <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
                    </span>
                  ) : isCurrent ? (
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    </span>
                  ) : (
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 bg-white group-hover:border-slate-400">
                      <Circle className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="ml-4 flex min-w-0 flex-col">
                  <span
                    className={`text-sm font-semibold tracking-wide uppercase ${
                      isComplete || isCurrent ? "text-blue-600" : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="text-sm text-slate-500">{step.description}</span>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
