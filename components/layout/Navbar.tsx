'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Eye, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-8 py-4 bg-white/80 backdrop-blur-md border-b border-outline-variant/20 shadow-sm">
      <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold text-on-surface group">
        <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-primary-container to-primary-container/80 text-white shadow-sm shadow-primary-container/20 group-hover:opacity-90 transition-opacity">
          <Eye size={20} strokeWidth={2.5} />
        </span>
        BuySim
      </Link>
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
        <Link
          href={isHome ? '#how-it-works' : '/#how-it-works'}
          className="hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container-low"
        >
          How it works
        </Link>
        <Link
          href={isHome ? '#agents' : '/#agents'}
          className="hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container-low"
        >
          Agents
        </Link>
        <Link
          href="/analysis"
          className="inline-flex items-center gap-1.5 bg-primary-container text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-sm shadow-primary-container/20"
        >
          Analysis
          <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  );
}
