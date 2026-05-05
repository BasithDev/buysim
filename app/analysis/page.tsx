'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import SimulationResults from '@/components/analysis/SimulationResults';
import { readSseEvents } from '@/lib/sse';
import { type SimulationResult } from '@/lib/gemini';
import { type ProgressStep, type AnalysisResult } from '@/lib/types';

const STORAGE_KEY = 'buysim_analysis_result';

function AnalysisPageInner() {
  const [isLoading, setIsLoading] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return JSON.parse(cached) as AnalysisResult;
    } catch { /* ignore */ }
    return null;
  });
  const [error, setError] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  // Simulation state
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simError, setSimError] = useState('');
  const [simProgress, setSimProgress] = useState<ProgressStep[]>([]);
  const [simCurrentStep, setSimCurrentStep] = useState(0);

  // Abort controllers for cleanup on unmount
  const analysisAbortRef = useRef<(() => void) | null>(null);
  const simAbortRef = useRef<(() => void) | null>(null);

  useEffect(() => () => {
    analysisAbortRef.current?.();
    simAbortRef.current?.();
  }, []);

  const runAnalysis = useCallback(async (url: string) => {
    analysisAbortRef.current?.();
    const controller = new AbortController();
    analysisAbortRef.current = () => controller.abort();

    setIsLoading(true);
    setProgressSteps([]);
    setCurrentStep(1);
    setResult(null);
    setError('');
    setSimResult(null);
    setSimError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const bodyText = await res.text();
        throw new Error(bodyText || `HTTP ${res.status}`);
      }

      let completed = false;
      for await (const event of readSseEvents(res)) {
        if (controller.signal.aborted) break;
        const typed = event as Record<string, unknown>;
        if (typed.type === 'progress') {
          setCurrentStep(typed.step as number);
          setProgressSteps((prev) => [...prev, typed as unknown as ProgressStep]);
        } else if (typed.type === 'complete') {
          completed = true;
          const data = typed.data as AnalysisResult;
          setResult(data);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
        } else if (typed.type === 'error') {
          setError(typed.message as string);
          break;
        }
      }
      // Stream closed without 'complete' or 'error' — likely server timeout
      if (!completed && !error && !controller.signal.aborted) {
        setError(
          progressSteps.length > 0
            ? 'Analysis timed out — the server took too long. Try again.'
            : 'Failed to connect to the analysis server. Try again.'
        );
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Analysis Error in page.tsx:', err);
      if (err instanceof Error) setError(err.message || 'Analysis failed');
      else setError('Analysis failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runSimulation = useCallback(async () => {
    if (!result) return;
    simAbortRef.current?.();
    const controller = new AbortController();
    simAbortRef.current = () => controller.abort();

    setSimLoading(true);
    setSimResult(null);
    setSimError('');
    setSimProgress([]);
    setSimCurrentStep(1);

    try {
      const res = await fetch('/api/simulate-buying', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainProduct: result.mainProduct,
          competitors: result.competitors,
          comparison: result.comparison,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const bodyText = await res.text();
        throw new Error(bodyText || `HTTP ${res.status}`);
      }

      for await (const event of readSseEvents(res)) {
        if (controller.signal.aborted) break;
        const typed = event as Record<string, unknown>;
        if (typed.type === 'progress') {
          setSimCurrentStep((typed.step as number) || 0);
          setSimProgress((prev) => [...prev, {
            step: (typed.step as number) || 0,
            total: (typed.total as number) || 6,
            message: (typed.message as string) || '',
            done: typed.done as boolean,
          }]);
        } else if (typed.type === 'complete') {
          setSimResult(typed.data as SimulationResult);
        } else if (typed.type === 'error') {
          setSimError(typed.message as string);
          break;
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Simulation Error in page.tsx:', err);
      if (err instanceof Error) setSimError(err.message || 'Simulation failed');
      else setSimError('Simulation failed');
    } finally {
      setSimLoading(false);
    }
  }, [result]);

  return (
    <>
      <SubNav hasResults={!!result} />

      <main className="min-h-screen bg-surface">
        <div className="px-6 md:px-12 py-6 bg-surface-container-low border-b border-outline/20">
          <AnalysisInput
            onSubmit={(url) => { setInputUrl(url); runAnalysis(url); }}
            isLoading={isLoading}
            initialUrl={inputUrl}
          />
        </div>

        <div className="px-6 md:px-12 py-8 max-w-[1280px] mx-auto space-y-10">

          <AnimatePresence>
            {isLoading && (
              <AnalysisLoading steps={progressSteps} currentStep={currentStep} />
            )}
          </AnimatePresence>

          {error && (
            <ErrorFallback error={error} onRetry={() => inputUrl && runAnalysis(inputUrl)} lastUrl={inputUrl} />
          )}

          {result && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <ListingGrade grade={result.comparison.grade || 'N/A'} />
                <ExportReport result={result} />
              </div>

              <section id="product-context" className="scroll-mt-16">
                <ProductContext
                  product={result.mainProduct}
                  listingScore={result.comparison.listingScore}
                />
              </section>

              <section id="listing-optimization" className="scroll-mt-16">
                <h2 className="font-display text-xl font-bold text-on-surface mb-4">Listing Optimization</h2>
                <ListingOptimization
                  comparison={result.comparison}
                  originalTitle={result.mainProduct.title}
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

              <section id="simulate-buying" className="scroll-mt-16 pt-6 border-t border-outline/10">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-6"
                >
                  <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
                    See why buyers convert — or don&apos;t
                  </h2>
                  <p className="text-sm text-on-surface-variant max-w-lg mx-auto">
                    We simulate 5 real buyer psychology profiles to show you where you lose conversions and why.
                  </p>
                </motion.div>

                <div className="flex justify-center mb-8">
                  <SimulateBuying onClick={runSimulation} isLoading={simLoading} />
                </div>

                {(simLoading || simResult || simError) && (
                  <SimulationResults
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

          {!isLoading && !result && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary-container/15 to-secondary/10 flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
                Ready to analyze your product
              </h2>
              <p className="text-sm text-on-surface-variant max-w-sm">
                Paste an Amazon product URL above and we&apos;ll show you how it compares to competitors.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}

export default function AnalysisPage() {
  return <AnalysisPageInner />;
}
