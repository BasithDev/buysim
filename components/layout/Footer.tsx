import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/20 bg-white/60 backdrop-blur-md mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-6">
        <div className="flex items-start gap-3 text-sm">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container-low shrink-0 mt-0.5">
            <ShieldAlert size={14} className="text-on-surface-variant/60" />
          </div>
          <div className="text-on-surface-variant/70 leading-relaxed space-y-1">
            <p>
              <span className="font-semibold text-on-surface-variant">Demo only.</span>{' '}
              This product is for demonstration purposes. Analysis results are generated using 3rd-party AI services (Google Gemini) and may not reflect accurate market data.
            </p>
            <p>
              As this is a shared demo environment, you may encounter{' '}
              <span className="font-semibold text-on-surface-variant">rate limiting errors</span>.{' '}
              Please be mindful of usage limits and expect occasional delays or failures during peak times.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-outline-variant/15 text-xs text-on-surface-variant/40 flex justify-between items-center">
          <span>© {new Date().getFullYear()} BuySim — Built for demo purposes</span>
          <span>AI analysis powered by Google Gemini</span>
        </div>
      </div>
    </footer>
  );
}
