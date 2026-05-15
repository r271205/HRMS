const styles = {
  success: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/25',
  warning: 'bg-amber-500/12 text-amber-800 dark:text-amber-200 ring-1 ring-amber-500/25',
  danger: 'bg-rose-500/12 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/25',
  info: 'bg-cyan-500/12 text-cyan-800 dark:text-cyan-200 ring-1 ring-cyan-500/25',
  neutral: 'bg-slate-500/10 text-slate-700 dark:text-slate-200 ring-1 ring-slate-500/15',
};

export default function Badge({ children, variant = 'neutral' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-accent font-semibold capitalize tracking-wide ${styles[variant] || styles.neutral}`}
    >
      {children}
    </span>
  );
}
