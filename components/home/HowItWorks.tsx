'use client';

import { motion } from 'framer-motion';
import { Link2, Users, CheckSquare } from 'lucide-react';

const steps = [
  {
    number: "1",
    title: "Paste URL",
    description: "Simply drop in the link to your Amazon product page. We currently only support Amazon, but will support other major platforms soon.",
    icon: <Link2 size={22} />,
    numberBg: "bg-surface-container",
    numberColor: "text-primary"
  },
  {
    number: "2",
    title: "Simulate Buyers",
    description: "Our diverse AI agents evaluate your page based on distinct psychological profiles, price sensitivities, and shopping habits.",
    icon: <Users size={22} />,
    numberBg: "bg-secondary-container",
    numberColor: "text-secondary"
  },
  {
    number: "3",
    title: "Get Actionable Report",
    description: "Receive a detailed report with exact fixes to improve your listing, prioritized by impact on conversion.",
    icon: <CheckSquare size={22} />,
    numberBg: "bg-surface-dim",
    numberColor: "text-on-surface-variant"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 bg-white text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-display text-3xl md:text-4xl font-bold mb-14 text-on-surface"
      >
        How it works
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="border border-outline-variant/30 rounded-xl p-6 text-left bg-white hover:border-outline-variant/50 hover:shadow-md transition-all duration-200"
          >
            <div className={`inline-flex justify-center items-center w-9 h-9 ${step.numberBg} ${step.numberColor} font-data font-bold rounded-lg mb-6`}>
              {step.number}
            </div>
            <div className="mb-5 text-on-surface">
              {step.icon}
            </div>
            <h3 className="font-display text-lg font-bold mb-3 text-on-surface">
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
