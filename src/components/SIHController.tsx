import React, { useState } from 'react';
import { useDemo, TrackingDemoState } from '../context/DemoContext';
import { Settings, RefreshCw, AlertTriangle, CheckCircle, Play, ArrowRight, X } from 'lucide-react';

export const SIHController: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackingState, triggerDemoState, resetDemo, activeAppId, currentStep, setWorkflowStep } = useDemo();

  const states: { state: TrackingDemoState; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      state: 'SUBMITTED',
      label: '1. Submitted',
      icon: <Play className="w-4 h-4 text-blue-500" />,
      desc: 'Starts application workflow (0/3 complete).'
    },
    {
      state: 'REVENUE_SUCCESS',
      label: '2. Revenue Approved',
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      desc: 'Revenue completes verification (1/3 complete).'
    },
    {
      state: 'FOOD_SUCCESS',
      label: '3. Food Approved',
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      desc: 'Food Department completes verification (2/3 complete).'
    },
    {
      state: 'RURAL_FAILURE',
      label: '4. Rural System Down',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      desc: 'Rural Dev system offline. Triggers GovMesh queue retry.'
    },
    {
      state: 'RURAL_RETRYING',
      label: '5. Auto-Retrying',
      icon: <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" />,
      desc: 'Simulates automatic retry loops on the live timeline.'
    },
    {
      state: 'RURAL_SUCCESS',
      label: '6. Rural Recovered',
      icon: <CheckCircle className="w-4 h-4 text-indigo-500" />,
      desc: 'Rural Dev succeeds. Dynamic recovery completes (3/3 complete).'
    },
    {
      state: 'ACTION_REQUIRED_STATE',
      label: '⚠ Action Required',
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      desc: 'Revenue requests clearer proof. Prompts upload banner.'
    },
    {
      state: 'ACTION_RESOLVED',
      label: '✔ Action Resolved',
      icon: <CheckCircle className="w-4 h-4 text-teal-500" />,
      desc: 'Citizen uploads corrected document. Workflow resumes.'
    }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gov-dark text-white rounded-full shadow-gov-lg hover:bg-slate-800 border border-slate-700 font-medium text-sm transition-all transform hover:scale-105"
        title="SIH Demo Controller"
      >
        <Settings className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>SIH Demo Controller</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-slate-900 text-slate-100 shadow-gov-lg z-50 border-l border-slate-800 transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-400" />
            <div>
              <h2 className="font-bold text-sm text-white">GovMesh SIH 2026</h2>
              <p className="text-[10px] text-slate-400">Prototype Demo Controller</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Quick Flow Direct Nav */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
              Quick Navigation
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { setWorkflowStep('INPUT'); }}
                className={`py-2 px-3 rounded border text-left font-medium transition ${
                  currentStep === 'INPUT' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-slate-800 bg-slate-950 hover:bg-slate-850'
                }`}
              >
                1. NL Form Input
              </button>
              <button
                onClick={() => { setWorkflowStep('CONSENT_FORM'); }}
                className={`py-2 px-3 rounded border text-left font-medium transition ${
                  currentStep === 'CONSENT_FORM' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-slate-800 bg-slate-950 hover:bg-slate-850'
                }`}
              >
                2. Consent Form
              </button>
              <button
                onClick={() => { setWorkflowStep('DOC_UPLOAD'); }}
                className={`py-2 px-3 rounded border text-left font-medium transition ${
                  currentStep === 'DOC_UPLOAD' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-slate-800 bg-slate-950 hover:bg-slate-850'
                }`}
              >
                3. Doc Upload
              </button>
              <button
                onClick={() => { setWorkflowStep('SUCCESS_SPLASH'); }}
                className={`py-2 px-3 rounded border text-left font-medium transition ${
                  currentStep === 'SUCCESS_SPLASH' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-slate-800 bg-slate-950 hover:bg-slate-850'
                }`}
              >
                4. App Created
              </button>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Workflow State Machine */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Timeline Demo States
              </span>
              {activeAppId ? (
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded">
                  Active ID: {activeAppId}
                </span>
              ) : (
                <span className="text-[9px] bg-red-500/20 text-red-300 font-mono px-2 py-0.5 rounded">
                  No Active App
                </span>
              )}
            </div>
            
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Use these triggers to advance the tracking timeline for `GM-2026-000124` during your demo presentation.
            </p>

            <div className="space-y-2">
              {states.map(({ state, label, icon, desc }) => {
                const isActive = trackingState === state;
                return (
                  <button
                    key={state}
                    onClick={() => triggerDemoState(state)}
                    disabled={!activeAppId}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      isActive
                        ? 'border-yellow-400 bg-yellow-400/10 text-white'
                        : activeAppId
                        ? 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-200'
                        : 'border-slate-850 bg-slate-900 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-semibold text-xs">
                        {icon}
                        <span>{label}</span>
                      </div>
                      {isActive && (
                        <span className="text-[9px] uppercase font-bold text-yellow-400">
                          Active State
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={resetDemo}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-slate-800 text-slate-200 rounded hover:bg-slate-700 hover:text-white transition w-full justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Environment</span>
          </button>
        </div>
      </div>
    </>
  );
};
