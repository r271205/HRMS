import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Palmtree,
  UserCircle,
  LogOut,
  Menu,
  Moon,
  Sun,
  Sparkles,
  ChevronLeft,
  CalendarDays,
  BarChart3,
  Clock,
  Zap,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { mediaUrl } from '../utils/format.js';
import GlobalSearch from '../components/layout/GlobalSearch.jsx';
import NotificationPanel from '../components/layout/NotificationPanel.jsx';

const adminLinks = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/employees', label: 'Team', icon: Users },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/leaves', label: 'Leave', icon: Palmtree },
];

const employeeLinks = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/leaves', label: 'Leave', icon: Palmtree },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function greeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const links = isAdmin ? adminLinks : employeeLinks;
  const now = useClock();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatar = mediaUrl(user?.avatar || user?.employee?.profileImage);
  const displayName = user?.employee?.fullName || user?.email?.split('@')[0] || 'there';
  const hour = now.getHours();

  const NavItem = ({ link, collapsed }) => (
    <NavLink
      to={link.to}
      end={link.end}
      onClick={() => setDrawerOpen(false)}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
          collapsed ? 'justify-center px-0' : 'px-3'
        } ${
          isActive
            ? 'bg-gradient-to-r from-brand-600/18 to-cyan-600/10 text-brand-800 dark:text-brand-200 shadow-sm ring-1 ring-brand-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
        }`
      }
    >
      <link.icon className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
      {!collapsed && <span className="truncate">{link.label}</span>}
    </NavLink>
  );

  const bottomNav = [
    { to: '/', icon: LayoutDashboard, label: 'Home', end: true },
    { to: '/calendar', icon: CalendarDays, label: 'Cal' },
    ...(isAdmin ? [{ to: '/employees', icon: Users, label: 'Team' }] : []),
    { to: '/leaves', icon: Palmtree, label: 'Leave' },
    { to: '/profile', icon: UserCircle, label: 'You' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface-50 dark:bg-surface-950 bg-mesh-light dark:bg-mesh-dark">
      {/* Decorative floating orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl animate-float" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-500/8 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      </div>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="relative z-20 hidden lg:flex flex-col border-r border-white/50 dark:border-slate-800/80 glass-strong shrink-0"
      >
        <div className={`p-5 flex items-center gap-3 ${sidebarCollapsed ? 'justify-center flex-col gap-2' : ''}`}>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-brand-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 ring-1 ring-white/25 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight tracking-tight">Nexus HR</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">People OS</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavItem key={link.to} link={link} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/80 space-y-1">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                sidebarCollapsed ? 'justify-center px-0' : 'px-3'
              } ${isActive ? 'text-brand-700 dark:text-brand-300 bg-brand-500/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'}`
            }
          >
            <UserCircle className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            {!sidebarCollapsed && 'Profile'}
          </NavLink>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 dark:text-slate-400 ${sidebarCollapsed ? 'justify-center' : 'px-3'}`}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && 'Collapse'}
          </button>
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 w-[min(88vw,300px)] flex flex-col glass-strong lg:hidden border-r border-white/40 dark:border-slate-800"
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800">
                <span className="font-display font-bold text-slate-900 dark:text-white">Menu</span>
                <button type="button" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setDrawerOpen(false)}>
                  <Menu className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {links.map((link) => (
                  <NavItem key={link.to} link={link} collapsed={false} />
                ))}
                <NavItem link={{ to: '/profile', label: 'Profile', icon: UserCircle }} collapsed={false} />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 flex flex-col min-w-0 min-h-0 pb-16 lg:pb-0">
        <header className="sticky top-0 z-30 border-b border-white/40 dark:border-slate-800/80 glass-strong px-4 lg:px-8 py-3 lg:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <button
                type="button"
                className="lg:hidden p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 shadow-sm"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-accent font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400"
                >
                  {greeting(hour)}, {displayName}
                </motion.p>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {location.pathname === '/' ? 'Command center' : ''}
                  {location.pathname.startsWith('/employees') && 'Team directory'}
                  {location.pathname.startsWith('/calendar') && 'Schedule'}
                  {location.pathname.startsWith('/analytics') && 'Insights'}
                  {location.pathname.startsWith('/attendance') && 'Attendance'}
                  {location.pathname.startsWith('/leaves') && 'Time away'}
                  {location.pathname.startsWith('/profile') && 'Your profile'}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/40 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5 text-brand-500" />
                <span className="font-medium tabular-nums">
                  {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} ·{' '}
                  {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <GlobalSearch onNavigate={() => setDrawerOpen(false)} />
              <div className="hidden md:flex items-center gap-1.5">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/attendance')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-600 bg-white/70 dark:bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-cyan-400/40 hover:shadow-md transition-all"
                >
                  <Zap className="h-3.5 w-3.5 text-cyan-500" />
                  Check-in
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/leaves')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-500/25"
                >
                  Apply leave
                </motion.button>
              </div>
              <NotificationPanel />
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-600 bg-white/70 dark:bg-slate-900/50 hover:shadow-md transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-[18px] w-[18px] text-amber-400" /> : <Moon className="h-[18px] w-[18px] text-slate-700" />}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-600 bg-white/80 dark:bg-slate-900/50 py-1 pl-1 pr-2 hover:shadow-md transition-all"
                >
                  <div className="h-9 w-9 rounded-lg overflow-hidden ring-2 ring-brand-500/20 bg-gradient-to-br from-brand-500 to-violet-600">
                    {avatar ? (
                      <img src={avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white text-xs font-bold">
                        {(user?.employee?.fullName || user?.email || '?').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="hidden xl:block text-left max-w-[120px]">
                    <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">{displayName}</span>
                    <span className="block text-[10px] text-slate-500 capitalize">{user?.role}</span>
                  </span>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <button type="button" className="fixed inset-0 z-[80]" onClick={() => setProfileOpen(false)} aria-hidden />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 380 }}
                        className="absolute right-0 top-full z-[85] mt-2 w-52 overflow-hidden rounded-xl border border-white/60 dark:border-slate-600 bg-white/95 dark:bg-slate-900/95 shadow-xl backdrop-blur-xl py-1"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/profile');
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800"
                        >
                          <Settings className="h-4 w-4" /> Settings
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <LogOut className="h-4 w-4" /> Log out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/50 dark:border-slate-800 glass-strong pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around px-1 py-2">
          {bottomNav.map((item) => (
            <NavLink
              key={item.to + (item.end ? 'e' : '')}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <item.icon className="h-5 w-5" strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
