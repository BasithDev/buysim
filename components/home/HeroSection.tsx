'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShieldCheck, Clock, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-linear-to-b from-surface-container-low via-white to-white py-20 md:py-28 px-4 text-center flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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
        transition={{ duration: 0.3, delay: 0.05 }}
        className="font-display text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl mx-auto mb-6 text-on-surface leading-tight"
      >
        See your listing through your{' '}
        <span className="relative inline-block whitespace-nowrap">
          <span className="bg-linear-to-r from-primary-container to-secondary bg-clip-text text-transparent">
            buyer&apos;s eyes.
          </span>
          <motion.svg
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5, ease: 'easeInOut' }}
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
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed"
      >
        Paste your product URL and let our simulated agents stress-test your value proposition in seconds.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mb-8"
      >
        <Link
          href="/analysis"
          className="inline-flex items-center gap-2 bg-primary-container text-white px-8 py-4 rounded-xl font-semibold text-base hover:opacity-90 transition-all shadow-md shadow-primary-container/20 active:scale-[0.97]"
        >
          Analyze your listing <ArrowRight size={18} />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
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
