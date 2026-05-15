import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, max = 100, className = '' }) {
  const pct = Math.min(100, Math.max(0, max ? (value / max) * 100 : 0));
  return (
    <div className={`h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 via-violet-500 to-cyan-500"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 24, delay: 0.15 }}
      />
    </div>
  );
}
