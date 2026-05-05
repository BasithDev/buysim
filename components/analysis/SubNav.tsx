'use client';

interface SubNavProps {
  hasResults: boolean;
}

const SECTIONS = [
  { id: 'product-context', label: 'Product Context' },
  { id: 'listing-optimization', label: 'Listing Optimization' },
  { id: 'market-comparison', label: 'Market Comparison' },
  { id: 'ai-insights', label: 'AI Insights' },
  { id: 'simulate-buying', label: 'Simulate Buying' },
];

export default function SubNav({ hasResults }: SubNavProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="sticky top-0 z-10 flex gap-1 px-6 md:px-8 py-2 bg-white/80 backdrop-blur-md border-b border-outline-variant/20 overflow-x-auto">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollTo(section.id)}
          disabled={!hasResults}
          className={`relative pb-2.5 px-3 text-sm font-medium whitespace-nowrap transition-all rounded-lg ${
            hasResults
              ? 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low cursor-pointer'
              : 'text-on-surface-variant/30 cursor-not-allowed'
          }`}
        >
          {section.label}
          {hasResults && (
            <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary-container scale-x-0 group-hover:scale-x-100 transition-transform rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
