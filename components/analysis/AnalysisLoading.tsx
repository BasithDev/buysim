'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface ProgressStep {
  step: number;
  total: number;
  message: string;
  done?: boolean;
  error?: boolean;
  durationMs?: number;
}

const STEPS = [
  { icon: '01', label: 'Fetching product details', desc: 'Scraping title, price, images and specs' },
  { icon: '02', label: 'Analyzing listing', desc: 'Parsing features and key specifications' },
  { icon: '03', label: 'Finding competitors', desc: 'Searching the marketplace for similar products' },
  { icon: '04', label: 'Comparing products', desc: 'Normalizing prices, ratings and specs side by side' },
  { icon: '05', label: 'Generating AI insights', desc: 'Running competitive analysis with Gemini' },
];

export default function AnalysisLoading({ steps, currentStep }: { steps: ProgressStep[]; currentStep: number }) {
  // Mark steps as complete if they have done:true OR if a higher step is now active
  const completedSteps = new Set(steps.filter((s) => s.done).map((s) => s.step));
  for (let i = 1; i < currentStep; i++) {
    completedSteps.add(i);
  }
  const latestStep = steps[steps.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {/* Animated icon */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-container/20 to-secondary/15 flex items-center justify-center mb-8"
      >
        <span className="text-2xl font-display font-extrabold bg-gradient-to-r from-primary-container to-secondary bg-clip-text text-transparent">
          {STEPS[Math.max(0, currentStep - 1)]?.icon || '01'}
        </span>
      </motion.div>

      {/* Current step label */}
      <motion.h2
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-on-surface mb-2"
      >
        {STEPS[Math.max(0, currentStep - 1)]?.label || latestStep?.message || 'Starting analysis...'}
      </motion.h2>

      <motion.p
        key={currentStep + '-desc'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-on-surface-variant max-w-md mb-10"
      >
        {STEPS[Math.max(0, currentStep - 1)]?.desc || ''}
      </motion.p>

      {/* Step progress track */}
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isCompleted = completedSteps.has(stepNum);
            const isCurrent = currentStep === stepNum && !isCompleted;

            return (
              <div key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <div
                    className={`w-3 md:w-8 h-[2px] transition-colors duration-500 ${
                      isCompleted ? 'bg-[#22c55e]' : isCurrent ? 'bg-primary-container' : 'bg-outline-variant/30'
                    }`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    isCompleted
                      ? 'bg-[#22c55e] text-white shadow-sm shadow-[#22c55e]/30'
                      : isCurrent
                        ? 'bg-primary-container text-white shadow-sm shadow-primary-container/30'
                        : 'bg-surface-container text-on-surface-variant/40'
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
              </div>
            );
          })}
        </div>

        {/* Latest log message */}
        <AnimatePresence mode="wait">
          {latestStep && (
            <motion.div
              key={latestStep.message + latestStep.step}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-outline-variant/30 rounded-xl px-4 py-3 text-left flex items-center gap-3 shadow-sm">
                <span className="text-xs font-data text-on-surface-variant/50 shrink-0 bg-surface-container-low px-2 py-0.5 rounded">
                  {STEPS[latestStep.step - 1]?.icon || '·'}
                </span>
                <span className="text-sm text-on-surface flex-1">{latestStep.message}</span>
                {latestStep.durationMs && (
                  <span className="text-xs font-data text-on-surface-variant/50 shrink-0">
                    {(latestStep.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
