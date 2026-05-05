'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import SubNav from '@/components/analysis/SubNav';
import AnalysisInput from '@/components/analysis/AnalysisInput';
import AnalysisLoading from '@/components/analysis/AnalysisLoading';
import ErrorFallback from '@/components/analysis/ErrorFallback';
import SimulateBuying from '@/components/analysis/SimulateBuying';
import ListingGrade from '@/components/analysis/ListingGrade';
import ListingOptimization from '@/components/analysis/ListingOptimization';
import ExportReport from '@/components/analysis/ExportReport';
import ProductContext from '@/components/analysis/ProductContext';
import MarketComparison from '@/components/analysis/MarketComparison';
import AiInsight from '@/components/analysis/AiInsight';
import { type ProductData, type ComparisonResult, type SimulationResult } from '@/lib/gemini';

interface AnalysisResult {
  mainProduct: ProductData;
  competitors: ProductData[];
  comparison: ComparisonResult;
  meta: { totalScrapes: number; competitorAsins: string[]; timeTakenMs: number };
}

interface ProgressStep {
  step: number;
  total: number;
  message: string;
  done?: boolean;
  error?: boolean;
  durationMs?: number;
}

const STORAGE_KEY = 'buysim_analysis_result';

function AnalysisPageInner() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  // Simulation state
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simError, setSimError] = useState('');
  const [simProgress, setSimProgress] = useState<ProgressStep[]>([]);
  const [simCurrentStep, setSimCurrentStep] = useState(0);

  const runAnalysis = useCallback(async (url: string) => {
    setIsLoading(true);
    setProgressSteps([]);
    setCurrentStep(1);
    setResult(null);
    setError('');
    setSimResult(null);
    setSimError('');

    try {
      const res = await fetch('/api/test-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No stream');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'progress') {
              setCurrentStep(event.step);
              setProgressSteps((prev) => [...prev, event]);
            } else if (event.type === 'complete') {
              const data = event.data as AnalysisResult;
              setResult(data);
              try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
            } else if (event.type === 'error') {
              setError(event.message);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runSimulation = useCallback(async () => {
    if (!result) return;
    setSimLoading(true);
    setSimResult(null);
    setSimError('');
    setSimProgress([]);
    setSimCurrentStep(1);

    // Scroll to simulation section
    setTimeout(() => {
      document.getElementById('simulate-buying')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);

    try {
      const res = await fetch('/api/simulate-buying', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainProduct: result.mainProduct,
          competitors: result.competitors,
          comparison: result.comparison,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No stream');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'progress') {
              setSimCurrentStep(event.step || 0);
              setSimProgress((prev) => [...prev, {
                step: event.step || 0,
                total: event.total || 6,
                message: event.message || '',
                done: event.done,
              }]);
            } else if (event.type === 'complete') {
              setSimResult(event.data);
            } else if (event.type === 'error') {
              setSimError(event.message);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setSimError(err.message || 'Simulation failed');
    } finally {
      setSimLoading(false);
    }
  }, [result]);

  // Auto-trigger if URL param present
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setInputUrl(urlParam);
      runAnalysis(urlParam);
    }
  }, [searchParams, runAnalysis]);

  return (
    <>
      <SubNav hasResults={!!result} />

      <main className="min-h-screen bg-surface">
        {/* Input bar — always visible */}
        <div className="px-6 md:px-12 py-6 bg-surface-container-low border-b border-outline/20">
          <AnalysisInput onSubmit={runAnalysis} isLoading={isLoading} initialUrl={inputUrl} />
        </div>

        <div className="px-6 md:px-12 py-8 max-w-[1280px] mx-auto space-y-10">

          {/* Loading animation */}
          <AnimatePresence>
            {isLoading && (
              <AnalysisLoading steps={progressSteps} currentStep={currentStep} />
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <ErrorFallback error={error} onRetry={() => inputUrl && runAnalysis(inputUrl)} lastUrl={inputUrl} />
          )}

          {/* Results — scroll sections */}
          {result && (
            <div className="space-y-10">
              {/* Listing Grade */}
              <div className="flex items-center justify-between">
                <ListingGrade grade={result.comparison.grade || 'N/A'} />
                <ExportReport result={result} />
              </div>

              <section id="product-context" className="scroll-mt-16">
                <ProductContext
                  product={result.mainProduct}
                  listingScore={result.comparison.listingScore}
                />
              </section>

              {/* Listing Optimization */}
              <section id="listing-optimization" className="scroll-mt-16">
                <h2 className="font-display text-xl font-bold text-on-surface mb-4">Listing Optimization</h2>
                <ListingOptimization
                  comparison={result.comparison}
                  originalTitle={result.mainProduct.title}
                  originalFeatures={result.mainProduct.features}
                />
              </section>

              <section id="market-comparison" className="scroll-mt-16">
                <MarketComparison
                  comparison={result.comparison}
                  mainAsin={result.mainProduct.asin}
                />
              </section>

              <section id="ai-insights" className="scroll-mt-16">
                <AiInsight insights={result.comparison.insights} />
              </section>

              {/* Simulate Buying Section */}
              <section id="simulate-buying" className="scroll-mt-16 pt-6 border-t border-outline/10">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-6"
                >
                  <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
                    See why buyers convert — or don't
                  </h2>
                  <p className="text-sm text-on-surface-variant max-w-lg mx-auto">
                    We simulate 5 real buyer psychology profiles to show you where you lose conversions and why.
                  </p>
                </motion.div>

                <div className="flex justify-center mb-8">
                  <SimulateBuying onClick={runSimulation} isLoading={simLoading} />
                </div>

                {/* Simulation loading / results */}
                {(simLoading || simResult || simError) && (
                  <SimulationProgressAndResults
                    loading={simLoading}
                    result={simResult}
                    error={simError}
                    progressSteps={simProgress}
                    currentStep={simCurrentStep}
                    onRetry={runSimulation}
                  />
                )}
              </section>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !result && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-container/15 to-secondary/10 flex items-center justify-center mb-5">
                <span className="text-3xl font-display font-extrabold bg-gradient-to-r from-primary-container to-secondary bg-clip-text text-transparent">
                  00
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
                Ready to analyze your product
              </h2>
              <p className="text-sm text-on-surface-variant max-w-sm">
                Paste an Amazon product URL above and we'll show you how it compares to competitors.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}

/** Presentational component for simulation progress + results */
function SimulationProgressAndResults({
  loading, result, error, progressSteps, currentStep, onRetry,
}: {
  loading: boolean;
  result: SimulationResult | null;
  error: string;
  progressSteps: ProgressStep[];
  currentStep: number;
  onRetry: () => void;
}) {
  const PERSONA_ICONS: Record<string, string> = {
    'Budget Buyer': '💰',
    'Review-Driven': '⭐',
    'Quality Seeker': '🔧',
    'Brand Loyal': '🏷️',
    'Listing Quality': '📝',
  };
  const completedSteps = new Set(progressSteps.filter((s) => s.done).map((s) => s.step));

  // Simulation phase: 1=loading, 2=simulating (Gemini call), 3=done
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
          /* Simulation in progress — show continuous animation */
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
            {/* Show loading states for each persona */}
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
          /* Initial loading or finalizing */
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
        {/* Summary bar */}
        <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-surface-container-low to-white rounded-xl px-5 py-4 border border-outline-variant/20 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-on-surface-variant">Simulated conversion rate</span>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-container to-secondary bg-clip-text text-transparent">
              {Math.round((buyCount / result.personas.length) * 100)}%
            </span>
            <span className="text-sm text-on-surface-variant">
              ({buyCount} buy · {fenceCount} fence · {skipCount} skip)
            </span>
          </div>
        </div>

        {/* Persona cards */}
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
                    &ldquo;{persona.monologue}&rdquo;
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

        {/* Key Takeaway */}
        {result.summary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-surface-container-low to-white border border-outline-variant/20 rounded-xl p-5 space-y-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">💡</span>
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

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <AnalysisPageInner />
    </Suspense>
  );
}
