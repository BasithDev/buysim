'use client';

import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { type SimulationResult } from '@/lib/gemini';
import { type ProgressStep } from '@/lib/types';

const PERSONA_ICONS: Record<string, string> = {
  'Budget Buyer': '\u{1F4B0}',
  'Review-Driven': '⭐',
  'Quality Seeker': '\u{1F527}',
  'Brand Loyal': '\u{1F3F7}️',
  'Listing Quality': '\u{1F4DD}',
};

export default function SimulationResults({
  loading, result, error, progressSteps, currentStep, onRetry,
}: {
  loading: boolean;
  result: SimulationResult | null;
  error: string;
  progressSteps: ProgressStep[];
  currentStep: number;
  onRetry: () => void;
}) {
  const completedSteps = new Set(progressSteps.filter((s) => s.done).map((s) => s.step));
  const isSimulating = currentStep === 2 && !completedSteps.has(2);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center mb-4 text-error shadow-sm shadow-error/10">
          <AlertTriangle size={24} />
        </div>
        <h3 className="font-display text-lg font-bold text-on-surface mb-2">Simulation failed</h3>
        <p className="text-sm text-on-surface-variant max-w-md mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-primary-container text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm shadow-primary-container/20"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </motion.div>
    );
  }

  if (loading && !result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="py-12"
      >
        {isSimulating ? (
          <div className="text-center">
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                  className="w-3 h-3 rounded-full bg-primary-container"
                />
              ))}
            </div>
            <h3 className="font-display text-lg font-bold text-on-surface mb-2">
              Running buyer simulations...
            </h3>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
              5 AI buyers are evaluating your listing against competitors. This takes a moment.
            </p>
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {['Budget Buyer', 'Review-Driven', 'Quality Seeker', 'Brand Loyal', 'Listing Quality'].map((name, i) => (
                <motion.div
                  key={name}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  className="flex items-center gap-1.5 bg-surface-container-low/50 border border-outline-variant/20 rounded-full px-3 py-1.5"
                >
                  <span className="text-xs">{PERSONA_ICONS[name]}</span>
                  <span className="text-xs font-medium text-on-surface-variant">{name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Loader2 size={20} className="animate-spin text-secondary mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-on-surface mb-1">
              {progressSteps.length > 0 ? progressSteps[progressSteps.length - 1]?.message : 'Starting simulation...'}
            </h3>
          </div>
        )}
      </motion.div>
    );
  }

  if (result) {
    const personaNames = (result as SimulationResult & { personaNames?: string[] }).personaNames || [];
    const buyCount = result.personas.filter((p) => p.verdict === 'buy').length;
    const skipCount = result.personas.filter((p) => p.verdict === 'skip').length;
    const fenceCount = result.personas.length - buyCount - skipCount;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mb-6 bg-linear-to-r from-surface-container-low to-white rounded-xl px-5 py-4 border border-outline-variant/20 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-sm font-semibold text-on-surface-variant">Simulated conversion rate</span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-display font-bold bg-linear-to-r from-primary-container to-secondary bg-clip-text text-transparent">
                {Math.round((buyCount / result.personas.length) * 100)}%
              </span>
              <span className="text-sm text-on-surface-variant">
                ({buyCount} buy &middot; {fenceCount} fence &middot; {skipCount} skip)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {result.personas.map((persona, i) => {
            const personaName = personaNames[i] || '';
            const verdictConfig = {
              'buy': { bg: 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20', label: '✓ Would Buy' },
              'skip': { bg: 'bg-error/10 text-error border border-error/20', label: '✗ Would Skip' },
              'on-the-fence': { bg: 'bg-secondary/10 text-secondary border border-secondary/20', label: '~ On the Fence' },
            };
            const vc = verdictConfig[persona.verdict as keyof typeof verdictConfig] || verdictConfig['on-the-fence'];

            return (
              <motion.div
                key={persona.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-outline-variant/30 rounded-xl p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{PERSONA_ICONS[persona.name] || '•'}</span>
                    <div>
                      <span className="font-display font-bold text-sm text-on-surface">
                        {personaName && <span className="text-on-surface">{personaName}</span>}
                        {personaName && <span className="text-on-surface-variant/50 font-normal"> —</span>}
                        <span className="text-on-surface-variant">{persona.name}</span>
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${vc.bg}`}>
                    {vc.label}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          persona.confidence >= 70 ? 'bg-[#22c55e]' : persona.confidence >= 50 ? 'bg-secondary' : 'bg-outline-variant/50'
                        }`}
                        style={{ width: `${persona.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-data font-bold text-on-surface-variant shrink-0">{persona.confidence}%</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed italic">
                    \&ldquo;{persona.monologue}\&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-outline-variant/20">
                  <p className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider mb-1">Where we lost them</p>
                  <p className="text-sm text-on-surface leading-relaxed font-medium">{persona.where_we_lost}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {result.summary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-linear-to-br from-surface-container-low to-white border border-outline-variant/20 rounded-xl p-5 space-y-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{'\u{1F4A1}'}</span>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Key Takeaway</p>
            </div>
            <p className="text-sm text-on-surface leading-relaxed">{result.summary}</p>
            <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/20">
              <p className="text-xs text-on-surface-variant">
                Need better listing visuals? Try{' '}
                <a
                  href="https://pixii.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-primary-container hover:opacity-80 transition-opacity"
                >
                  pixii.ai
                  <ExternalLink size={11} />
                </a>
                {' '}— AI-powered image design for your product listing.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return null;
}
