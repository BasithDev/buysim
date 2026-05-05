'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShieldCheck, Clock, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('Please enter a valid Amazon URL');
      return;
    }

    if (!url.toLowerCase().includes('amazon.')) {
      setError('URL must be an Amazon product link (e.g. amazon.in/dp/ASIN)');
      return;
    }

    // Navigate to /analysis with URL as query param — auto-triggers analysis
    router.push(`/analysis?url=${encodeURIComponent(url)}`);
  };

  return (
    <section className="bg-gradient-to-b from-surface-container-low via-white to-white py-20 md:py-28 px-4 text-center flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-on-surface px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-outline-variant/30 mb-8 shadow-sm"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-container/10 text-primary-container">
          <Zap size={12} fill="currentColor" />
        </span>
        AI-Powered Buying Simulation
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-display text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl mx-auto mb-6 text-on-surface leading-tight"
      >
        See your listing through your{' '}
        <span className="relative inline-block whitespace-nowrap">
          <span className="bg-gradient-to-r from-primary-container to-secondary bg-clip-text text-transparent">
            buyer's eyes.
          </span>
          <motion.svg
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: 'easeInOut' }}
            viewBox="0 0 300 20"
            preserveAspectRatio="none"
            className="absolute -bottom-3 left-0 w-full h-auto text-primary-container/60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 15C40 5 100 0 150 5C200 10 260 15 298 5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 18C45 8 105 3 155 8C205 13 265 18 295 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          </motion.svg>
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed"
      >
        Paste your product URL and let our simulated agents stress-test your value proposition in seconds.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-2xl mb-8"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center bg-white border-2 border-outline-variant/40 rounded-xl p-1.5 shadow-sm focus-within:border-primary-container/50 focus-within:shadow-lg focus-within:shadow-primary-container/5 transition-all duration-300">
          <input
            type="url"
            placeholder="Paste your Amazon product URL here..."
            className="flex-1 border-none outline-none px-4 py-3 text-base text-on-surface font-body bg-transparent w-full placeholder:text-on-surface-variant/40"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            type="submit"
            className="bg-primary-container text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm shadow-primary-container/20 active:scale-[0.97]"
          >
            Analyze <ArrowRight size={16} />
          </button>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-error text-sm mt-3 text-left pl-4 font-medium bg-error/5 border border-error/10 rounded-lg px-4 py-2"
          >
            {error}
          </motion.div>
        )}
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm text-on-surface-variant/70 font-medium"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-on-surface-variant/40" />
          No login required
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-on-surface-variant/40" />
          Results in ~60s
        </div>
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-on-surface-variant/40" />
          Free to use
        </div>
      </motion.div>
    </section>
  );
}
