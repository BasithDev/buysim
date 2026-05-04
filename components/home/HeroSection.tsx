"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export default function HeroSection() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/analyze-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start analysis');
      }
      
      router.push(`/analyzing`);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-linear-to-b from-surface-container-low to-white py-24 px-4 text-center flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-surface-container text-on-surface px-4 py-1.5 rounded-full text-sm font-semibold border border-outline-variant mb-8 shadow-sm"
      >
        <span className="text-primary-container"><Zap size={16} fill="currentColor" /></span> AI-Powered Buying Simulation — New
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-display text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl mx-auto mb-6 text-on-surface leading-tight"
      >
        See your listing through your <span className="relative inline-block whitespace-nowrap">
          buyer's eyes.
          <motion.svg 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
            viewBox="0 0 300 20" 
            preserveAspectRatio="none" 
            className="absolute -bottom-3 left-0 w-full h-auto text-primary-container"
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
        className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed"
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
        <div className="flex items-center bg-white border border-outline-variant rounded-xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:border-primary-container focus-within:shadow-[0_8px_30px_rgba(255,149,0,0.1)] transition-all duration-300">
          <input 
            type="url" 
            placeholder="https://your-product-listing.com" 
            className="flex-1 border-none outline-none px-4 py-3 text-base text-on-surface font-body bg-transparent w-full"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-primary-container text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity ml-2 shrink-0" 
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze'} 
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </div>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-error text-sm mt-3 text-left pl-4 font-medium">
            {error}
          </motion.div>
        )}
      </motion.form>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-on-surface-variant font-medium"
      >
        <div className="flex items-center gap-6">
          <span>No login required</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span>Results in ~60s</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span>Free to use</span>
        </div>
      </motion.div>
    </section>
  );
}
