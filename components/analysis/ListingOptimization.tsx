'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Copy, Check } from 'lucide-react';
import { ComparisonResult } from '@/lib/gemini';

interface ListingOptimizationProps {
  comparison: ComparisonResult;
  originalTitle: string;
}

function CopyAllButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-semibold text-on-surface-variant/50 hover:text-on-surface transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied All' : 'Copy All'}
    </button>
  );
}

function SectionCard({ icon, title, children, defaultOpen = true }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-container-low/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low">{icon}</span>
          <h3 className="font-display font-bold text-sm text-on-surface">{title}</h3>
        </div>
        <ChevronDown size={16} className={`text-on-surface-variant/40 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-outline-variant/20 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ListingOptimization({ comparison, originalTitle }: ListingOptimizationProps) {
  const { titleSuggestion, featureBulletSuggestions, keywordGaps, reviewGaps } = comparison;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Title Rewrite */}
      {titleSuggestion && (
        <SectionCard icon={<span className="text-sm">✏️</span>} title="AI-Suggested Title">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-1.5">Current Title</p>
              <p className="text-sm text-on-surface-variant bg-surface-container-low/50 rounded-lg px-3 py-2.5 border border-outline-variant/20">
                {originalTitle}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant/60 uppercase tracking-wider mb-1.5">Suggested Title</p>
              <div className="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-lg px-3 py-2.5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 group">
                <p className="text-sm text-on-surface leading-relaxed flex-1">{titleSuggestion}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(titleSuggestion); }}
                  className="self-end sm:self-auto shrink-0 text-xs font-semibold text-on-surface-variant/40 hover:text-on-surface transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-surface-container-low"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Feature Bullets */}
      {featureBulletSuggestions?.length > 0 && (
        <SectionCard icon={<span className="text-sm">📝</span>} title="AI-Suggested Feature Bullets">
          <div className="space-y-2 mb-3">
            {featureBulletSuggestions.map((bullet, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="text-primary-container text-xs font-bold mt-1 shrink-0">•</span>
                <p className="text-sm text-on-surface leading-relaxed flex-1">{bullet}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <CopyAllButton text={featureBulletSuggestions.join('\n')} />
          </div>
        </SectionCard>
      )}

      {/* Keyword Gaps */}
      {keywordGaps?.missingKeywords?.length > 0 && (
        <SectionCard icon={<span className="text-sm">🔑</span>} title="Missing Keywords" defaultOpen={false}>
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant leading-relaxed">{keywordGaps.explanation}</p>
            <div className="flex flex-wrap gap-2">
              {keywordGaps.missingKeywords.map((kw) => (
                <span key={kw} className="text-xs font-semibold bg-error/8 text-error px-3 py-1.5 rounded-lg border border-error/15">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Review Gaps */}
      {reviewGaps?.competitorPainPoints?.length > 0 && (
        <SectionCard icon={<span className="text-sm">💬</span>} title="Customer Pain Points" defaultOpen={false}>
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant leading-relaxed">{reviewGaps.explanation}</p>
            <div className="space-y-2">
              {reviewGaps.competitorPainPoints.map((point, i) => (
                <div key={i} className="flex gap-2.5 items-start bg-error/4 border border-error/10 rounded-lg px-3 py-2">
                  <span className="text-error text-xs font-bold mt-0.5 shrink-0">⚡</span>
                  <p className="text-sm text-on-surface">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}
    </motion.div>
  );
}
