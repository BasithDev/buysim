'use client';

import { motion } from 'framer-motion';
import { type ComparisonResult } from '@/lib/gemini';

interface MarketComparisonProps {
  comparison: ComparisonResult;
  mainAsin: string;
}

export default function MarketComparison({ comparison, mainAsin }: MarketComparisonProps) {
  const { normalizedProducts } = comparison;
  if (!normalizedProducts?.length) return null;

  const mainProduct = normalizedProducts.find((p) => p.asin === mainAsin) || normalizedProducts[0];
  const competitors = normalizedProducts.filter((p) => p.asin !== mainAsin);

  // Determine best values for highlighting
  const allPrices = normalizedProducts.map((p) => p.price).filter(Boolean);
  const bestPrice = Math.min(...allPrices);
  const bestRating = Math.max(...normalizedProducts.map((p) => p.rating || 0));
  const bestReviews = Math.max(...normalizedProducts.map((p) => p.reviewCount || 0));

  // Build rows from data
  const keySpecKeys = Object.keys(mainProduct.keySpecs || {});

  type Row = { label: string; values: string[]; highlights: boolean[] };
  const rows: Row[] = [
    {
      label: 'Price',
      values: normalizedProducts.map((p) => `${p.currency}${p.price.toFixed(2)}`),
      highlights: normalizedProducts.map((p) => p.price === bestPrice),
    },
    {
      label: 'Rating',
      values: normalizedProducts.map((p) => p.rating ? `${p.rating} / 5.0` : 'N/A'),
      highlights: normalizedProducts.map((p) => p.rating === bestRating && p.rating > 0),
    },
    {
      label: 'Review Count',
      values: normalizedProducts.map((p) => p.reviewCount ? p.reviewCount.toLocaleString() : 'N/A'),
      highlights: normalizedProducts.map((p) => p.reviewCount === bestReviews && p.reviewCount > 0),
    },
    {
      label: 'Capacity',
      values: normalizedProducts.map((p) => p.capacity || 'N/A'),
      highlights: normalizedProducts.map(() => false),
    },
    {
      label: 'Material',
      values: normalizedProducts.map((p) => p.material || 'N/A'),
      highlights: normalizedProducts.map(() => false),
    },
    ...keySpecKeys.map((key) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      values: normalizedProducts.map((p) => p.keySpecs?.[key] || 'N/A'),
      highlights: normalizedProducts.map(() => false),
    })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white border border-outline rounded-lg p-6"
    >
      <h2 className="font-display text-xl font-bold text-on-surface mb-5">Market Comparison</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline">
              <th className="text-left py-3 px-4 font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                Metric
              </th>
              <th className="text-left py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-on-surface">
                    Your Product
                  </span>
                </div>
              </th>
              {competitors.map((comp, i) => (
                <th key={comp.asin} className="text-left py-3 px-4">
                  <span className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                    {comp.brand || `Competitor ${String.fromCharCode(65 + i)}`}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <motion.tr
                key={row.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + ri * 0.05 }}
                className={`border-b border-outline/50 ${ri % 2 === 1 ? 'bg-[#f8f9fa]' : ''}`}
              >
                <td className="py-3 px-4 font-medium text-on-surface-variant">{row.label}</td>
                {row.values.map((val, vi) => (
                  <td
                    key={vi}
                    className={`py-3 px-4 font-data text-sm ${
                      row.highlights[vi]
                        ? 'bg-primary-container/15 text-primary font-bold'
                        : 'text-on-surface'
                    }`}
                  >
                    {val}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
