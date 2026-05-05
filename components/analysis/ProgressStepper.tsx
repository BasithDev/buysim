'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Circle } from 'lucide-react';

interface ProgressStep {
  step: number;
  total: number;
  message: string;
  done?: boolean;
  error?: boolean;
  durationMs?: number;
}

interface ProgressStepperProps {
  steps: ProgressStep[];
  currentStep: number;
}

const STEP_LABELS = [
  { icon: '🔍', label: 'Getting Details' },
  { icon: '🧠', label: 'Analyzing' },
  { icon: '🔎', label: 'Finding Rivals' },
  { icon: '⚔️', label: 'Comparing' },
  { icon: '📊', label: 'AI Insights' },
  { icon: '✅', label: 'Complete' },
];

export default function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  const completedSteps = new Set(
    steps.filter((s) => s.done).map((s) => s.step)
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-6">
        {STEP_LABELS.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = completedSteps.has(stepNum);
          const isCurrent = currentStep === stepNum && !isCompleted;

          return (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <div
                  className={`w-8 md:w-14 h-[2px] mx-1 transition-colors duration-500 ${
                    isCompleted ? 'bg-[#22c55e]' : isCurrent ? 'bg-secondary' : 'bg-outline'
                  }`}
                />
              )}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    isCompleted
                      ? 'bg-[#22c55e] text-white'
                      : isCurrent
                        ? 'bg-secondary text-white'
                        : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isCurrent ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`hidden md:inline text-xs font-medium transition-colors ${
                    isCompleted
                      ? 'text-[#22c55e]'
                      : isCurrent
                        ? 'text-secondary'
                        : 'text-on-surface-variant/50'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log messages */}
      <div className="bg-white border border-outline rounded-lg p-4 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 py-1.5"
            >
              <span className="text-[10px] font-data text-on-surface-variant/60 w-6 text-right shrink-0">
                {step.durationMs ? `${(step.durationMs / 1000).toFixed(0)}s` : ''}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  step.done
                    ? 'bg-[#22c55e]'
                    : step.error
                      ? 'bg-error'
                      : 'bg-secondary'
                }`}
              />
              <span className="text-sm font-body text-on-surface-variant">
                {step.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {currentStep > 0 && !completedSteps.has(6) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 py-1.5"
          >
            <span className="w-6" />
            <Loader2 size={10} className="animate-spin text-secondary shrink-0" />
            <span className="text-sm font-body text-on-surface-variant/60 italic">
              Processing...
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
