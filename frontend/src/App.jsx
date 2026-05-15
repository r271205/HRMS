import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  const { initializing } = useAuth();
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 bg-mesh-dark relative overflow-hidden">
        <motion.div
          className="absolute h-96 w-96 rounded-full bg-brand-600/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 opacity-40 blur-xl animate-pulse-soft" />
            <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 shadow-glow flex items-center justify-center">
              <motion.div
                className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-lg font-bold text-white tracking-tight">Nexus HR</p>
            <p className="text-sm text-white/55 mt-1">Preparing your workspace…</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/*" element={<AppRoutes />} />
    </Routes>
  );
}

export default App;
