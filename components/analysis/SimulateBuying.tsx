'use client';

import { useState } from 'react';
import { ShoppingCart, Zap, Loader2, Wallet, Star, Wrench, BadgeCheck, FileText } from 'lucide-react';

const BUY_TYPES = [
  { icon: <Wallet size={14} />, label: 'Budget Buyer', desc: 'Seeks the cheapest option' },
  { icon: <Star size={14} />, label: 'Review-Driven', desc: 'Relies heavily on ratings & reviews' },
  { icon: <Wrench size={14} />, label: 'Quality Seeker', desc: 'Wants the best specs and materials' },
  { icon: <BadgeCheck size={14} />, label: 'Brand Loyal', desc: 'Prefers trusted, well-known brands' },
  { icon: <FileText size={14} />, label: 'Listing Quality', desc: 'Judges by listing presentation' },
];

interface SimulateBuyingProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function SimulateBuying({ onClick, isLoading }: SimulateBuyingProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={isLoading}
        onMouseEnter={() => setHovered(!isLoading)}
        onMouseLeave={() => setHovered(false)}
        className="group flex items-center gap-3 bg-gradient-to-r from-primary-container to-primary-container/90 text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary-container/20 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Running Simulation...
          </>
        ) : (
          <>
            <Zap size={20} className="fill-white" />
            Simulate Buying
            <ShoppingCart size={18} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Tooltip */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[320px] transition-all duration-200 ${
          hovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-xl p-4 text-left">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
            Simulates real buyer behavior types
          </p>
          <div className="space-y-2.5">
            {BUY_TYPES.map((bt) => (
              <div key={bt.label} className="flex items-start gap-2.5">
                <span className="text-on-surface-variant mt-0.5 shrink-0">{bt.icon}</span>
                <div>
                  <span className="text-sm font-semibold text-on-surface">{bt.label}</span>
                  <span className="block text-xs text-on-surface-variant">{bt.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Arrow */}
        <div className="flex justify-center -mt-1">
          <div className="w-3 h-3 bg-white border-r border-b border-outline-variant/30 rotate-45 translate-y-[-1px]" />
        </div>
      </div>
    </div>
  );
}
