'use client';

import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, Wrench } from 'lucide-react';
import { type ComparisonResult } from '@/lib/gemini';

interface AiInsightProps {
  insights: ComparisonResult['insights'];
}

export default function AiInsight({ insights }: AiInsightProps) {
  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-5"
    >
      {/* Summary Card */}
      <div className="bg-white border border-outline rounded-lg p-6 border-l-4 border-l-secondary">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} className="text-secondary" />
          <h3 className="font-display text-base font-bold text-on-surface">AI Insight</h3>
        </div>
        <p className="text-sm font-body text-on-surface-variant leading-relaxed">
          {insights.summary}
        </p>
      </div>

      {/* Strengths, Weaknesses, Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-outline rounded-lg p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
              <TrendingUp size={14} className="text-[#22c55e]" />
            </div>
            <h4 className="font-display text-sm font-bold text-on-surface">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {insights.strengths?.map((s, i) => (
              <li key={i} className="text-xs font-body text-on-surface-variant leading-relaxed pl-3 border-l-2 border-[#22c55e]/30">
                {s}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-outline rounded-lg p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-error/10 flex items-center justify-center">
              <TrendingDown size={14} className="text-error" />
            </div>
            <h4 className="font-display text-sm font-bold text-on-surface">Weaknesses</h4>
          </div>
          <ul className="space-y-2">
            {insights.weaknesses?.map((w, i) => (
              <li key={i} className="text-xs font-body text-on-surface-variant leading-relaxed pl-3 border-l-2 border-error/30">
                {w}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Improvements */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white border border-outline rounded-lg p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-primary-container/10 flex items-center justify-center">
              <Wrench size={14} className="text-primary-container" />
            </div>
            <h4 className="font-display text-sm font-bold text-on-surface">Improvements</h4>
          </div>
          <ul className="space-y-2">
            {insights.improvements?.map((imp, i) => (
              <li key={i} className="text-xs font-body text-on-surface-variant leading-relaxed pl-3 border-l-2 border-primary-container/30">
                {imp}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
