'use client';

import { motion } from 'framer-motion';
import { type ProductData, type ComparisonResult } from '@/lib/gemini';

interface ProductContextProps {
  product: ProductData;
  listingScore: ComparisonResult['listingScore'];
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return '#22c55e';
    if (s >= 40) return '#ff9500';
    return '#ba1a1a';
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'EXCELLENT';
    if (s >= 60) return 'GOOD';
    if (s >= 40) return 'NEEDS WORK';
    return 'POOR';
  };

  const color = getColor(score);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={radius}
          fill="none" stroke="#f2dfd1" strokeWidth="8"
        />
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-display font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] font-bold tracking-wider text-on-surface-variant uppercase">
          {getLabel(score)}
        </span>
      </div>
    </div>
  );
}

function QualityBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 70) return 'bg-secondary';
    if (s >= 40) return 'bg-primary-container';
    return 'bg-error';
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <div className="flex justify-between items-center sm:block sm:w-44 shrink-0">
        <span className="text-sm font-semibold text-on-surface">{label}</span>
        <span className="text-sm font-data font-bold text-on-surface sm:hidden">
          {score}/100
        </span>
      </div>
      <div className="flex-1 h-2.5 bg-surface-container-low rounded-full overflow-hidden w-full">
        <motion.div
          className={`h-full rounded-full ${getColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
        />
      </div>
      <span className="hidden sm:block text-sm font-data font-bold text-on-surface w-12 text-right">
        {score}/100
      </span>
    </div>
  );
}

export default function ProductContext({ product, listingScore }: ProductContextProps) {
  const mainImage = product.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6"
    >
      {/* Product Card */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm">
        <h2 className="font-display text-sm font-bold text-on-surface-variant/60 uppercase tracking-wider mb-4">Product Context</h2>
        <div className="flex gap-3">
          {mainImage && (
            <div className="w-16 h-16 rounded-lg border border-outline-variant/30 overflow-hidden shrink-0 bg-surface-container-low">
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold text-on-surface line-clamp-2 leading-snug">
              {product.title}
            </h3>
            <p className="text-xs font-data text-on-surface-variant mt-1.5">
              ASIN: <span className="font-mono">{product.asin}</span>
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {product.category?.join(' › ')}
            </p>
          </div>
        </div>
      </div>

      {/* Score Ring */}
      <div className="flex items-center justify-center">
        <ScoreRing score={listingScore?.overall || 0} />
      </div>

      {/* Quality Bars */}
      <div className="bg-white border border-outline-variant/30 rounded-xl p-5 flex flex-col justify-center gap-4 shadow-sm">
        <QualityBar label="Visual Clarity" score={listingScore?.visualClarity || 0} />
        <QualityBar label="Information Hierarchy" score={listingScore?.informationHierarchy || 0} />
        <QualityBar label="Compelling CTA" score={listingScore?.compellingCta || 0} />
      </div>
    </motion.div>
  );
}
