'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Application error</h1>
        <p className="text-sm text-on-surface-variant mb-6 max-w-md">{error.message || 'A critical error occurred'}</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary-container text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
