import Link from 'next/link';
import { Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-white border-b border-outline/20">
      <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-on-surface">
        <span className="text-primary-container">
          <Eye size={24} strokeWidth={2.5} />
        </span>
        BuySim
      </Link>
      <div className="hidden md:flex gap-8 text-sm font-medium text-on-surface-variant">
        <Link href="#how-it-works" className="hover:text-on-surface transition-colors">How it works</Link>
        <Link href="#agents" className="hover:text-on-surface transition-colors">Agents</Link>
        <Link href="#analysis" className="hover:text-on-surface transition-colors">Analysis</Link>
        <Link href="#pricing" className="hover:text-on-surface transition-colors">Pricing</Link>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/login" className="text-sm font-medium text-on-surface hover:text-on-surface-variant transition-colors hidden sm:block">
          Log In
        </Link>
        <Link href="/get-started" className="bg-primary-container text-white px-5 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity">
          Get Started
        </Link>
      </div>
    </nav>
  );
}
