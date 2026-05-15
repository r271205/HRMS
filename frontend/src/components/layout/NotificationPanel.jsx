import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Inbox } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAppUi } from '../../context/AppUiContext.jsx';
import { formatDateTime } from '../../utils/format.js';

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, clearNotifications } = useAppUi();
  const { isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isAdmin || !open) return;
    (async () => {
      try {
        const { data } = await api.get('/api/leaves?status=pending&limit=1');
        if (data.success) setPendingCount(data.data.total || 0);
      } catch {
        /* ignore */
      }
    })();
  }, [isAdmin, open]);

  const badge = unreadCount;

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-600/60 bg-white/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:border-brand-300/50 hover:shadow-md transition-all"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" />
        {badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <button type="button" className="fixed inset-0 z-[90]" aria-hidden onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="absolute right-0 top-full z-[95] mt-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border border-white/60 dark:border-slate-600/60 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 px-4 py-3">
                <p className="font-display font-bold text-slate-900 dark:text-white">Notifications</p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="rounded-lg p-1.5 text-xs font-medium text-brand-600 hover:bg-brand-500/10 dark:text-brand-400"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isAdmin && pendingCount > 0 && (
                  <Link
                    to="/leaves"
                    onClick={() => setOpen(false)}
                    className="block border-b border-amber-500/15 bg-amber-500/5 px-4 py-3 text-sm hover:bg-amber-500/10 transition-colors"
                  >
                    <span className="font-semibold text-amber-800 dark:text-amber-200">{pendingCount} leave request(s)</span>
                    <span className="block text-xs text-slate-600 dark:text-slate-400">Awaiting your review</span>
                  </Link>
                )}
                {notifications.length === 0 && (
                  <div className="flex flex-col items-center py-10 text-slate-500">
                    <Inbox className="h-10 w-10 opacity-40 mb-2" />
                    <p className="text-sm">You&apos;re all caught up</p>
                  </div>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-slate-100 dark:border-slate-800/80 px-4 py-3 text-sm ${n.read ? 'opacity-60' : ''}`}
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                    {n.body && <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(n.at)}</p>
                  </div>
                ))}
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="w-full py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  Clear history
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
