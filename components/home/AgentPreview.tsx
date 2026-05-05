'use client';

import { motion } from 'framer-motion';
import { Wallet, Star, Wrench, BadgeCheck, FileText } from 'lucide-react';

const agents = [
  {
    name: 'Budget Buyer',
    role: 'Seeks the cheapest option',
    icon: <Wallet size={18} />,
    description: 'Compares prices across all listings and picks the lowest value that still meets basic needs. Highly sensitive to discounts and deals.',
    avatarBg: 'bg-secondary-container',
    avatarColor: 'text-secondary',
  },
  {
    name: 'Review-Driven',
    role: 'Relies heavily on ratings & reviews',
    icon: <Star size={18} />,
    description: 'Skips the listing copy and goes straight to customer reviews. Trusts social proof over anything else on the page.',
    avatarBg: 'bg-[#ebf1ff]',
    avatarColor: 'text-[#005cba]',
  },
  {
    name: 'Quality Seeker',
    role: 'Wants the best specs and materials',
    icon: <Wrench size={18} />,
    description: 'Reads every spec line, compares materials and build quality. Will pay more if the product justifies the price.',
    avatarBg: 'bg-surface-container',
    avatarColor: 'text-primary',
  },
  {
    name: 'Brand Loyal',
    role: 'Prefers trusted, well-known brands',
    icon: <BadgeCheck size={18} />,
    description: 'Looks for brand names they recognize and trust. Less likely to try unknown brands even if the price is better.',
    avatarBg: 'bg-surface-dim',
    avatarColor: 'text-on-surface-variant',
  },
  {
    name: 'Listing Quality',
    role: 'Judges by listing presentation',
    icon: <FileText size={18} />,
    description: 'Evaluates how professional the listing looks — images, descriptions, FAQs, and overall polish signal credibility.',
    avatarBg: 'bg-[#e1f3ff]',
    avatarColor: 'text-[#00658c]',
  },
];

export default function AgentPreview() {
  return (
    <section id="agents" className="py-20 md:py-28 px-4 bg-surface text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.3 }}
        className="font-display text-3xl md:text-4xl font-bold mb-4 text-on-surface"
      >
        Meet your 5 AI buyers
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="text-on-surface-variant text-base mb-14 max-w-2xl mx-auto"
      >
        A diverse panel representing real-world buyer behavior.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto place-items-start">
        {agents.map((agent, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.25,
              delay: index * 0.06,
              scale: { type: 'spring', stiffness: 400, damping: 17 },
            }}
            className="bg-white border border-outline-variant/30 rounded-xl p-5 text-left flex flex-col gap-3 w-full hover:-translate-y-1 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${agent.avatarBg} ${agent.avatarColor}`}>
                {agent.icon}
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-sm text-on-surface">{agent.name}</div>
                <div className="text-xs text-on-surface-variant">{agent.role}</div>
              </div>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              {agent.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
