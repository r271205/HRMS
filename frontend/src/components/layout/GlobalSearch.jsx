import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, LayoutDashboard, CalendarDays, BarChart3, Palmtree, X } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const adminShortcuts = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Employees', to: '/employees', icon: Users },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Leaves', to: '/leaves', icon: Palmtree },
];

const employeeShortcuts = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Leaves', to: '/leaves', icon: Palmtree },
];

export default function GlobalSearch({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const shortcuts = isAdmin ? adminShortcuts : employeeShortcuts;
  const inputRef = useRef();
  const debounce = useRef();

  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ('');
      setPeople([]);
    }
  }, [open]);

  const runSearch = useCallback(
    async (term) => {
      if (!isAdmin || !term.trim()) {
        setPeople([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get(`/api/employees?search=${encodeURIComponent(term.trim())}&limit=6`);
        if (data.success) setPeople(data.data.items || []);
      } catch {
        setPeople([]);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => runSearch(q), 280);
    return () => clearTimeout(debounce.current);
  }, [q, open, runSearch]);

  const go = (to) => {
    setOpen(false);
    onNavigate?.();
    navigate(to);
  };

  const filteredShortcuts = shortcuts.filter((s) => s.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-600/60 bg-white/60 dark:bg-slate-900/50 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:border-brand-300/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all min-w-[200px] lg:min-w-[260px]"
      >
        <Search className="h-4 w-4 shrink-0 opacity-60" />
        <span className="truncate text-left flex-1">Search…</span>
        <kbd className="hidden lg:inline text-[10px] font-sans font-medium px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-slate-600 bg-slate-100/80 dark:bg-slate-800">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4">
            <motion.button
              type="button"
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/60 dark:border-slate-600/60 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/60 px-3">
                <Search className="h-4 w-4 text-slate-400 ml-1" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search pages, employees…"
                  className="flex-1 bg-transparent py-3.5 text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
                {filteredShortcuts.length > 0 && (
                  <p className="px-2 py-1 text-[10px] font-accent font-bold uppercase tracking-wider text-slate-400">Jump to</p>
                )}
                {filteredShortcuts.map((s) => (
                  <button
                    key={s.to}
                    type="button"
                    onClick={() => go(s.to)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-500/10 dark:hover:bg-brand-500/15 transition-colors"
                  >
                    <s.icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                    {s.label}
                  </button>
                ))}
                {isAdmin && (
                  <>
                    <p className="px-2 py-2 text-[10px] font-accent font-bold uppercase tracking-wider text-slate-400">Employees</p>
                    {loading && <p className="px-3 py-2 text-xs text-slate-500">Searching…</p>}
                    {!loading &&
                      people.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => go(`/employees/${p._id}`)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 transition-colors"
                        >
                          <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span className="min-w-0">
                            <span className="block font-medium text-slate-900 dark:text-white truncate">{p.fullName}</span>
                            <span className="block text-xs text-slate-500 truncate">{p.department}</span>
                          </span>
                        </button>
                      ))}
                    {!loading && q.trim() && people.length === 0 && (
                      <p className="px-3 py-2 text-xs text-slate-500">No employees match.</p>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
