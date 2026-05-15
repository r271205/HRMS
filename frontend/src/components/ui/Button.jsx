import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary:
    'relative overflow-hidden bg-gradient-to-r from-brand-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-glow-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/15 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
  secondary:
    'bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-600/80 hover:border-brand-300/50 dark:hover:border-brand-500/30 hover:shadow-md backdrop-blur-sm',
  danger:
    'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/20 hover:from-rose-500 hover:to-rose-400',
  ghost:
    'text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 border border-transparent',
};

const Button = forwardRef(function Button(
  { className = '', variant = 'primary', loading, disabled, children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      type={props.type || 'button'}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
});

export default Button;
