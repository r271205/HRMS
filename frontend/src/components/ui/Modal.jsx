import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button.jsx';

export default function Modal({ open, title, onClose, children, footer, size = 'md' }) {
  const maxW = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg';
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close overlay"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative z-10 w-full ${maxW} overflow-hidden rounded-2xl border border-white/50 dark:border-slate-600/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.03] via-transparent to-cyan-500/[0.04] pointer-events-none" />
            <div className="relative flex items-start justify-between gap-4 border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-4">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
              <Button variant="ghost" className="!p-2 rounded-xl shrink-0" onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative px-6 py-5 text-slate-700 dark:text-slate-200">{children}</div>
            {footer && <div className="relative flex justify-end gap-2 border-t border-slate-200/60 dark:border-slate-700/60 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
