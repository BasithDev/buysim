import Link from 'next/link';
import { Eye } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row justify-between items-center gap-6 px-8 py-10 bg-white border-t border-outline/20 text-xs text-on-surface-variant font-medium">
      <div className="flex items-center gap-2 font-display text-lg font-bold text-on-surface">
        <span className="text-primary-container">
          <Eye size={20} strokeWidth={2.5} />
        </span>
        BuySim
      </div>
      
      <div className="flex flex-wrap justify-center gap-6">
        <Link href="/docs" className="hover:text-on-surface transition-colors">Documentation</Link>
        <Link href="/privacy" className="hover:text-on-surface transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-on-surface transition-colors">Terms of Service</Link>
        <Link href="/status" className="hover:text-on-surface transition-colors">API Status</Link>
      </div>
      
      <div>
        © 2024 BuySim AI. Precision procurement simulation.
      </div>
    </footer>
  );
}
