import React from 'react';
import { DepartmentStep } from '../types';
import { CheckCircle2, Clock, AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react';

interface TimelineProps {
  steps: DepartmentStep[];
  progressPercent: number;
}

export const Timeline: React.FC<TimelineProps> = ({ steps }) => {
  return (
    <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6 py-2">
      {/* Starting point node */}
      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-300 rounded-full border-4 border-white" />

      {steps.map((step, index) => {
        const isSuccess = step.status === 'SUCCESS';
        const isProcessing = step.status === 'PROCESSING';
        const isRetrying = step.status === 'RETRYING';
        const isFailed = step.status === 'FAILED';
        const isPending = step.status === 'PENDING';

        return (
          <div key={index} className="relative group transition-all">
            {/* Status node on the line */}
            <div className="absolute -left-[35px] top-1 bg-white rounded-full p-0.5">
              {isSuccess && <CheckCircle2 className="w-6 h-6 text-gov-success bg-white rounded-full" />}
              {isProcessing && <Clock className="w-6 h-6 text-gov-secondary bg-white rounded-full animate-pulse-slow" />}
              {isRetrying && <RefreshCw className="w-6 h-6 text-amber-500 bg-white rounded-full animate-spin" style={{ animationDuration: '3s' }} />}
              {isFailed && <AlertTriangle className="w-6 h-6 text-gov-failure bg-white rounded-full" />}
              {isPending && <HelpCircle className="w-6 h-6 text-slate-300 bg-white rounded-full" />}
            </div>

            {/* Department Card */}
            <div
              className={`p-4 rounded-xl border transition shadow-gov-sm ${
                isSuccess
                  ? 'border-emerald-100 bg-emerald-50/30'
                  : isRetrying
                  ? 'border-amber-200 bg-amber-50/40'
                  : isFailed
                  ? 'border-red-200 bg-red-50/30'
                  : isProcessing
                  ? 'border-blue-100 bg-blue-50/15'
                  : 'border-slate-100 bg-white/70 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                <h4 className="font-bold text-slate-800 text-sm">
                  {step.departmentName}
                </h4>
                <div className="flex items-center gap-2">
                  {step.timestamp && (
                    <span className="text-[10px] text-slate-450 font-mono">
                      {step.timestamp}
                    </span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isSuccess
                        ? 'bg-emerald-150 text-emerald-700'
                        : isRetrying
                        ? 'bg-amber-100 text-amber-800'
                        : isFailed
                        ? 'bg-red-100 text-red-700'
                        : isProcessing
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isSuccess ? 'Completed' : isRetrying ? 'Retrying Automatically' : isFailed ? 'Action Required' : isProcessing ? 'In Progress' : 'Pending Queue'}
                  </span>
                </div>
              </div>

              {/* Action Description */}
              <p className="text-xs font-semibold text-slate-600 mb-1">
                Role: {step.action}
              </p>

              {/* Remarks/Status */}
              {step.remarks && (
                <div className="mt-2 text-xs text-slate-500 bg-white/50 p-2.5 rounded-lg border border-slate-100/60 leading-relaxed">
                  {isRetrying && (
                    <span className="block font-bold text-amber-700 mb-1">
                      GovMesh Queue Alert:
                    </span>
                  )}
                  {isFailed && (
                    <span className="block font-bold text-red-700 mb-1">
                      Verification Alert:
                    </span>
                  )}
                  {step.remarks}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
