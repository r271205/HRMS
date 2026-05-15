import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <SearchX className="h-8 w-8" />
        </div>
        <p className="text-sm uppercase tracking-[0.2em] text-white/60 font-semibold">404</p>
        <h1 className="font-display text-4xl font-bold mt-2 mb-3">This page drifted away</h1>
        <p className="text-white/70 mb-8">The link may be broken or the resource was moved. Let’s get you back to the hub.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-brand-500 to-indigo-500 text-white shadow-lg shadow-brand-500/30 hover:from-brand-400 hover:to-indigo-400 transition"
        >
          <Home className="h-4 w-4" />
          Back to dashboard
        </Link>
      </motion.div>
    </div>
  );
}
