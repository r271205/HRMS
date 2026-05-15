import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(function Input(
  { label, error, className = '', id, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <label className="block w-full group">
      {label && (
        <span className="mb-1.5 block text-xs font-accent font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
      <motion.input
        ref={ref}
        whileFocus={{ scale: 1.005 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        id={inputId}
        className={`w-full rounded-xl border bg-white/95 dark:bg-slate-900/90 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-shadow duration-200 shadow-sm focus:ring-2 focus:ring-brand-500/35 focus:border-brand-400/50 dark:focus:border-brand-500/40 ${
          error ? 'border-rose-400 ring-1 ring-rose-400/30' : 'border-slate-200/90 dark:border-slate-600/80'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
    </label>
  );
});

export default Input;
