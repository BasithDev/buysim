'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, ArrowRight } from 'lucide-react';

interface AnalysisInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string;
}

export default function AnalysisInput({ onSubmit, isLoading, initialUrl }: AnalysisInputProps) {
  const [url, setUrl] = useState(initialUrl || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter an Amazon product URL');
      return;
    }

    if (!url.includes('amazon.')) {
      setError('Please enter a valid Amazon URL');
      return;
    }

    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-on-surface-variant/60">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your Amazon product URL..."
          disabled={isLoading}
          className="w-full pl-11 pr-36 py-4 bg-white border-2 border-outline-variant/50 rounded-xl font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-container/50 focus:ring-4 focus:ring-primary-container/10 transition-all disabled:opacity-50 shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 bg-primary-container text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-60 shadow-sm shadow-primary-container/20 active:scale-[0.97]"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2.5 text-sm text-error font-medium pl-1"
        >
          {error}
        </motion.p>
      )}
    </form>
  );
}
