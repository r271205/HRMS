import { motion } from 'framer-motion';
import AnimatedNumber from '../premium/AnimatedNumber.jsx';

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 28 } },
};

export function Card({ children, className = '', glow = false, ...props }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`group relative rounded-2xl border border-white/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl p-5 shadow-card hover:shadow-lift transition-shadow duration-300 overflow-hidden ${
        glow ? 'shadow-glow-sm' : ''
      } ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/10 to-cyan-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function StatCard({
  title,
  value,
  icon: Icon,
  accent = 'from-brand-500 via-violet-500 to-indigo-600',
  subtitle,
  trend,
  trendUp,
  numeric = true,
}) {
  const showAnimated = numeric && typeof value === 'number' && !Number.isNaN(value);
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="relative overflow-hidden rounded-2xl border border-white/70 dark:border-slate-700/50 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 shadow-card hover:shadow-lift"
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-[0.12] blur-2xl`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-accent font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {showAnimated ? <AnimatedNumber value={value} /> : value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{subtitle}</p>}
          {trend != null && (
            <p
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                trendUp === false
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg ring-1 ring-white/20`}
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
