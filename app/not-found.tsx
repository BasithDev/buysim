import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <h1 className="font-display text-6xl font-bold text-on-surface mb-4">404</h1>
      <p className="text-lg text-on-surface-variant mb-6">Page not found</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary-container text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Go Home
      </Link>
    </div>
  );
}
