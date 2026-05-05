'use client';

import { motion } from 'framer-motion';

interface ListingGradeProps {
  grade: string;
}

function getGradeConfig(grade: string) {
  switch (grade) {
    case 'A': return { color: '#22c55e', bg: 'bg-[#22c55e]/10', border: 'border-[#22c55e]/20', label: 'Excellent', sublabel: 'This listing stands out from the competition' };
    case 'B': return { color: '#22c55e', bg: 'bg-secondary/10', border: 'border-secondary/20', label: 'Good', sublabel: 'Minor improvements needed to compete' };
    case 'C': return { color: '#ff9500', bg: 'bg-primary-container/10', border: 'border-primary-container/20', label: 'Average', sublabel: 'Needs work to stand out in search results' };
    case 'D': return { color: '#e94560', bg: 'bg-error/10', border: 'border-error/20', label: 'Below Average', sublabel: 'Significant improvements needed' };
    case 'F': return { color: '#ba1a1a', bg: 'bg-error/10', border: 'border-error/20', label: 'Poor', sublabel: 'Major overhaul required to compete' };
    default: return { color: '#999', bg: 'bg-surface-container', border: 'border-outline/20', label: 'N/A', sublabel: '' };
  }
}

export default function ListingGrade({ grade }: ListingGradeProps) {
  const config = getGradeConfig(grade);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bg} ${config.border} rounded-2xl border p-6 flex items-center gap-5 shadow-sm`}
    >
      <div className="relative">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: `${config.color}12` }}
        >
          <span className="text-4xl font-display font-extrabold" style={{ color: config.color }}>
            {grade}
          </span>
        </div>
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
          style={{ backgroundColor: config.color }}
        />
      </div>
      <div>
        <h3 className="font-display text-xl font-bold text-on-surface">Listing Grade: {config.label}</h3>
        <p className="text-sm text-on-surface-variant mt-0.5">{config.sublabel}</p>
      </div>
    </motion.div>
  );
}
