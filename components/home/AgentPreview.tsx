"use client";

import { motion } from 'framer-motion';
import { User, Wallet, Zap, ShieldAlert, BadgeCheck, Building2, Cpu } from 'lucide-react';

const agents = [
  {
    name: 'Sarah',
    role: 'Value Shopper',
    icon: <User size={20} />,
    cornerIcon: <Wallet size={18} className="text-outline-variant" />,
    avatarBg: 'bg-secondary-container',
    avatarColor: 'text-secondary',
    tags: [
      { text: 'PRICE SENSITIVE', bg: 'bg-[#fff1e8]', color: 'text-[#8c5000]' },
      { text: 'COMPARES TABS', bg: 'bg-surface-dim', color: 'text-on-surface-variant' }
    ]
  },
  {
    name: 'Marcus',
    role: 'Impulse Buyer',
    icon: <User size={20} />,
    cornerIcon: <Zap size={18} className="text-outline-variant" />,
    avatarBg: 'bg-surface-container',
    avatarColor: 'text-primary',
    tags: [
      { text: 'HIGH INTENT', bg: 'bg-[#ebf1ff]', color: 'text-[#005cba]' },
      { text: 'SKIMS TEXT', bg: 'bg-surface-dim', color: 'text-on-surface-variant' }
    ]
  },
  {
    name: 'Priya',
    role: 'Skeptic',
    icon: <User size={20} />,
    cornerIcon: <ShieldAlert size={18} className="text-outline-variant" />,
    avatarBg: 'bg-secondary-container',
    avatarColor: 'text-secondary',
    tags: [
      { text: 'NEEDS PROOF', bg: 'bg-[#ffdad6]', color: 'text-[#93000a]' },
      { text: 'READS REVIEWS', bg: 'bg-surface-dim', color: 'text-on-surface-variant' }
    ]
  },
  {
    name: 'Alex',
    role: 'Brand Loyalist',
    icon: <User size={20} />,
    cornerIcon: <BadgeCheck size={18} className="text-outline-variant" />,
    avatarBg: 'bg-surface-dim',
    avatarColor: 'text-on-surface-variant',
    tags: [
      { text: 'AESTHETIC FOCUS', bg: 'bg-[#e1f3ff]', color: 'text-[#00658c]' },
      { text: 'SEEKS QUALITY', bg: 'bg-surface-dim', color: 'text-on-surface-variant' }
    ]
  },
  {
    name: 'Elena',
    role: 'Corporate Buyer',
    icon: <User size={20} />,
    cornerIcon: <Building2 size={18} className="text-outline-variant" />,
    avatarBg: 'bg-surface-dim',
    avatarColor: 'text-on-surface-variant',
    tags: [
      { text: 'ROI DRIVEN', bg: 'bg-[#ebf1ff]', color: 'text-[#005cba]' },
      { text: 'NEEDS INVOICES', bg: 'bg-surface-dim', color: 'text-on-surface-variant' }
    ]
  },
  {
    name: 'David',
    role: 'Tech Enthusiast',
    icon: <User size={20} />,
    cornerIcon: <Cpu size={18} className="text-outline-variant" />,
    avatarBg: 'bg-[#c5e7ff]',
    avatarColor: 'text-[#00658c]',
    tags: [
      { text: 'SPECS FOCUS', bg: 'bg-surface-dim', color: 'text-on-surface-variant' },
      { text: 'READS FAQS', bg: 'bg-surface-dim', color: 'text-on-surface-variant' }
    ]
  }
];

export default function AgentPreview() {
  return (
    <section id="agents" className="py-24 px-4 bg-surface text-center">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-display text-3xl md:text-4xl font-bold mb-4 text-on-surface"
      >
        Meet your 6 AI buyers
      </motion.h2>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-on-surface-variant text-lg mb-16 max-w-2xl mx-auto"
      >
        A diverse panel representing real-world market segments.
      </motion.p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {agents.map((agent, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              scale: { type: "spring", stiffness: 300, damping: 20 }
            }}
            className="bg-white border border-outline/30 rounded-2xl p-6 text-left flex flex-col gap-6"
          >
            <div className="flex items-center gap-4 relative">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${agent.avatarBg} ${agent.avatarColor}`}>
                {agent.icon}
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-on-surface">{agent.name}</div>
                <div className="text-sm text-on-surface-variant">{agent.role}</div>
              </div>
              <div className="absolute right-0 top-0">
                {agent.cornerIcon}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {agent.tags.map((tag, tIndex) => (
                <span 
                  key={tIndex} 
                  className={`text-[10px] font-bold px-2 py-1 rounded-md font-data tracking-wider uppercase ${tag.bg} ${tag.color}`}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
