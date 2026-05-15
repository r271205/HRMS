import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const UiContext = createContext(null);

const STORAGE_KEY = 'hrms_ui_notifications';
const MAX = 12;

function loadStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function AppUiProvider({ children }) {
  const [notifications, setNotifications] = useState(loadStored);

  const persist = useCallback((list) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX)));
    } catch {
      /* ignore */
    }
  }, []);

  const pushNotification = useCallback(
    (item) => {
      const n = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: item.title || 'Update',
        body: item.body || '',
        type: item.type || 'info',
        at: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => {
        const next = [n, ...prev].slice(0, MAX);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  useEffect(() => {
    const onNotify = (e) => {
      const d = e.detail || {};
      pushNotification({ title: d.title, body: d.body, type: d.type });
    };
    window.addEventListener('hrms:notify', onNotify);
    return () => window.removeEventListener('hrms:notify', onNotify);
  }, [pushNotification]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((x) => ({ ...x, read: true }));
      persist(next);
      return next;
    });
  }, [persist]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    persist([]);
  }, [persist]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      pushNotification,
      markAllRead,
      clearNotifications,
    }),
    [notifications, unreadCount, pushNotification, markAllRead, clearNotifications]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useAppUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useAppUi must be used within AppUiProvider');
  return ctx;
}

export function emitHrmsNotification(detail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('hrms:notify', { detail }));
}
