'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Something went wrong</h1>
      <p className="text-sm text-on-surface-variant mb-6 max-w-md">{error.message || 'An unexpected error occurred'}</p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-primary-container text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
