import React from 'react';
import { DepartmentStep } from '../types';
import { CheckCircle2, Clock, AlertTriangle, HelpCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface TimelineProps {
  steps: DepartmentStep[];
  progressPercent: number;
}

function formatUtcAndLocal(isoString?: string): { utc: string; local: string } {
  if (!isoString) return { utc: '', local: '' };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { utc: isoString, local: isoString };
    const utc = d.toISOString().replace('T', ' ').replace('Z', ' UTC');
    const local = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return { utc, local };
  } catch {
    return { utc: isoString, local: isoString };
  }
}

export const Timeline: React.FC<TimelineProps> = ({ steps }) => {
  return (
    <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6 py-2">
      {/* Starting point node */}
      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-indigo-500 rounded-full border-4 border-white shadow-sm" />

      {steps.map((step, index) => {
        const isSuccess = step.status === 'SUCCESS';
        const isProcessing = step.status === 'PROCESSING';
        const isRetrying = step.status === 'RETRYING';
        const isFailed = step.status === 'FAILED';
        const isPending = step.status === 'PENDING';
        const times = formatUtcAndLocal(step.timestamp || step.receivedAt);

        return (
          <div key={index} className="relative group transition-all">
            {/* Status node on the line */}
            <div className="absolute -left-[35px] top-1 bg-white rounded-full p-0.5">
              {isSuccess && <CheckCircle2 className="w-6 h-6 text-emerald-600 bg-white rounded-full" />}
              {isProcessing && <Clock className="w-6 h-6 text-indigo-600 bg-white rounded-full animate-pulse" />}
              {isRetrying && <RefreshCw className="w-6 h-6 text-amber-500 bg-white rounded-full animate-spin" style={{ animationDuration: '3s' }} />}
              {isFailed && <AlertTriangle className="w-6 h-6 text-rose-600 bg-white rounded-full" />}
              {isPending && <HelpCircle className="w-6 h-6 text-slate-300 bg-white rounded-full" />}
            </div>

            {/* Department Card */}
            <div
              className={`p-4 rounded-xl border transition shadow-sm ${
                isSuccess
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isRetrying
                  ? 'border-amber-200 bg-amber-50/40'
                  : isFailed
                  ? 'border-rose-200 bg-rose-50/20'
                  : isProcessing
                  ? 'border-indigo-100 bg-indigo-50/15'
                  : 'border-slate-100 bg-white/70 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">
                    {step.departmentName}
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {step.protocol || 'REST/JSON'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {times.utc && (
                    <span className="text-[10px] text-slate-450 font-mono" title={`Local: ${times.local}`}>
                      {times.utc}
                    </span>
                  )}
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isSuccess
                        ? 'bg-emerald-100 text-emerald-800'
                        : isRetrying
                        ? 'bg-amber-100 text-amber-800'
                        : isFailed
                        ? 'bg-rose-100 text-rose-800'
                        : isProcessing
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isSuccess ? '✓ Completed' : isRetrying ? 'Retrying Queue' : isFailed ? 'Action Required' : isProcessing ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Action Description */}
              <p className="text-xs font-semibold text-slate-600 mb-1">
                {step.action}
              </p>

              {/* Remarks/Status */}
              {step.remarks && (
                <div className="mt-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  {step.remarks}
                </div>
              )}

              {/* Cryptographic Traceability Footer */}
              {step.requestHash && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hash: {step.requestHash.slice(0, 18)}...</span>
                  </div>
                  {step.acknowledgementId && (
                    <span className="text-slate-400">Ack: {step.acknowledgementId}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
