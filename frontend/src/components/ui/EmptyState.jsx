import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function EmptyState({ title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-600/60 bg-gradient-to-b from-white/50 to-slate-50/30 dark:from-slate-900/40 dark:to-slate-950/30 py-16 px-6 text-center"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-cyan-500/10 ring-1 ring-brand-500/20">
        <Sparkles className="h-8 w-8 text-brand-600 dark:text-brand-400" />
      </div>
      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </motion.div>
  );
}
