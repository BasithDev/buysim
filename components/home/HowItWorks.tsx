"use client";

import { motion } from 'framer-motion';
import { Link2, Users, CheckSquare } from 'lucide-react';

const steps = [
  {
    number: "1",
    title: "Paste URL",
    description: "Simply drop in the link to your Amazon product page. We currently only support Amazon, but will support other major platforms soon.",
    icon: <Link2 size={24} />,
    numberBg: "bg-surface-container",
    numberColor: "text-primary"
  },
  {
    number: "2",
    title: "Simulate Buyers",
    description: "Our diverse AI agents evaluate your page based on distinct psychological profiles, price sensitivities, and shopping habits.",
    icon: <Users size={24} />,
    numberBg: "bg-secondary-container",
    numberColor: "text-secondary"
  },
  {
    number: "3",
    title: "Get Fix List",
    description: "Receive an actionable report detailing exactly what stopped buyers from converting, prioritized by impact.",
    icon: <CheckSquare size={24} />,
    numberBg: "bg-surface-dim",
    numberColor: "text-on-surface-variant"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-white text-center">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-display text-3xl md:text-4xl font-bold mb-16 text-on-surface"
      >
        How it works
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="border border-outline/30 rounded-2xl p-8 text-left bg-white hover:border-outline-variant transition-colors shadow-sm hover:shadow-md"
          >
            <div className={`inline-flex justify-center items-center w-10 h-10 ${step.numberBg} ${step.numberColor} font-data font-bold rounded-lg mb-8`}>
              {step.number}
            </div>
            <div className="mb-6 text-on-surface">
              {step.icon}
            </div>
            <h3 className="font-display text-xl font-bold mb-4 text-on-surface">
              {step.title}
            </h3>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
