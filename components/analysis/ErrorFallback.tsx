'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: string;
  onRetry?: () => void;
  lastUrl?: string;
}

function getErrorInfo(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes('rate limit') || lower.includes('429') || lower.includes('too many requests')) {
    return {
      title: 'Rate limit exceeded',
      description: 'We\'re getting too many requests at once. This is a demo environment with shared resources — please wait a moment and try again.',
    };
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch') || lower.includes('aborted')) {
    return {
      title: 'Connection error',
      description: 'We couldn\'t reach the analysis server. Check your internet connection and try again.',
    };
  }

  if (lower.includes('no stream')) {
    return {
      title: 'Server error',
      description: 'The analysis service didn\'t return a valid response. This may be a temporary issue — please retry.',
    };
  }

  if (lower.includes('gemini') || lower.includes('api key') || lower.includes('model')) {
    return {
      title: 'AI service error',
      description: 'The Gemini AI service encountered an issue. This could be due to rate limits or temporary downtime. Please try again shortly.',
    };
  }

  if (lower.includes('amazon') || lower.includes('scrape') || lower.includes('invalid url')) {
    return {
      title: 'Invalid product URL',
      description: message || 'We couldn\'t fetch product details from that URL. Make sure it\'s a valid Amazon product link.',
    };
  }

  return {
    title: 'Analysis failed',
    description: message || 'Something went wrong while analyzing your product. Please check the URL and try again.',
  };
}

export default function ErrorFallback({ error, onRetry, lastUrl }: ErrorFallbackProps) {
  const { title, description } = getErrorInfo(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mb-5 text-error shadow-sm shadow-error/10">
        <AlertTriangle size={30} />
      </div>

      <h2 className="font-display text-2xl font-bold text-on-surface mb-2">
        {title}
      </h2>

      <p className="text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-primary-container text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm shadow-primary-container/20"
        >
          <RefreshCw size={16} />
          {lastUrl ? 'Try Again' : 'Retry'}
        </button>
      )}
    </motion.div>
  );
}
