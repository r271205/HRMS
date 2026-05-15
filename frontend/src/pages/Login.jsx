import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const orbs = [
  { className: 'left-[10%] top-[20%] h-72 w-72 bg-violet-500/30', delay: 0 },
  { className: 'right-[5%] top-[40%] h-96 w-96 bg-cyan-500/25', delay: 0.5 },
  { className: 'left-[30%] bottom-[10%] h-64 w-64 bg-indigo-500/20', delay: 1 },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back — redirecting to your workspace.');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-surface-50 dark:bg-surface-950">
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white">
        {orbs.map((o, i) => (
          <motion.div
            key={i}
            className={`pointer-events-none absolute rounded-full blur-3xl ${o.className}`}
            animate={{ y: [0, -18, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: o.delay }}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_40%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 h-full">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center ring-1 ring-white/20 shadow-glow">
              <Sparkles className="h-8 w-8 text-cyan-300" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold tracking-tight">Nexus HR</p>
              <p className="text-sm text-white/60 font-medium">Premium people operations</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="max-w-lg">
            <h1 className="font-display text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight mb-6">
              The HR dashboard that feels like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300">product</span>, not a form.
            </h1>
            <p className="text-lg text-white/75 leading-relaxed">
              Glass surfaces, motion-rich interactions, and analytics that respect your time — built to impress on day one.
            </p>
          </motion.div>

          <p className="text-xs text-white/40 tracking-wide">© {new Date().getFullYear()} Nexus HR</p>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-6 bg-mesh-light dark:bg-mesh-dark">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-brand-500/40 via-cyan-500/25 to-violet-500/40 opacity-75 blur-sm" />
          <div className="relative rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <p className="text-xs font-accent font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">Secure access</p>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sign in</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">Enterprise-grade session handling with JWT.</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Work email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="you@company.com"
              />
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
              />
              <Button type="submit" className="w-full mt-2 py-3 text-base" loading={loading}>
                Enter workspace
              </Button>
            </form>
            <div className="mt-8 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/40 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <p className="font-accent font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[10px]">After seed</p>
              <p>
                <span className="font-semibold text-slate-800 dark:text-white">Owner:</span> rajan@gmail.com / Rajan@123
              </p>
              <p>
                <span className="font-semibold text-slate-800 dark:text-white">Admin:</span> admin@hrms.demo / Admin@123
              </p>
              <p>
                <span className="font-semibold text-slate-800 dark:text-white">Employee:</span> aisha@hrms.demo / Employee@123
              </p>
              <p className="text-slate-500 pt-1 text-[11px]">Run npm run seed in /backend</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
