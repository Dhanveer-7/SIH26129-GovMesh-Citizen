import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  steps: string[];
  currentStepIndex: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStepIndex }) => {
  return (
    <div className="w-full py-4">
      {/* Desktop / Tablet view */}
      <div className="hidden md:flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          
          return (
            <React.Fragment key={step}>
              {/* Step circle & label */}
              <div className="flex flex-col items-center flex-1 relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                    isCompleted
                      ? 'bg-gov-success border-gov-success text-white shadow-gov-sm'
                      : isActive
                      ? 'bg-gov-primary border-gov-primary text-white shadow-gov-md ring-4 ring-blue-100'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold text-center absolute top-10 whitespace-nowrap transition-colors ${
                    isActive ? 'text-gov-primary font-bold' : isCompleted ? 'text-slate-750 font-medium' : 'text-slate-450'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Line connector */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-slate-200 relative mx-2">
                  <div
                    className="absolute top-0 left-0 h-full bg-gov-success transition-all duration-300"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-gov-sm">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <h3 className="font-bold text-sm text-gov-primary">
            {steps[currentStepIndex]}
          </h3>
        </div>
        <div className="relative w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gov-primary transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Extra spacing for desktop steps since labels are absolutely positioned */}
      <div className="hidden md:block h-8"></div>
    </div>
  );
};
