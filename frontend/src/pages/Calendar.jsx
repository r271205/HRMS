import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { apiDayKey, formatDate, formatDateTime, localDayKey } from '../utils/format.js';

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const cells = [];
  let d = 1 - startPad;
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(year, month, d));
    d++;
  }
  return cells;
}

/** Month range as ISO strings for API (stable, no object reference churn) */
function monthRangeISO(year, month) {
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

function leaveDayKeys(fromDate, toDate) {
  const keys = [];
  const a = new Date(fromDate);
  const b = new Date(toDate);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return keys;
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  for (let t = new Date(a); t <= b; t.setDate(t.getDate() + 1)) {
    keys.push(localDayKey(t));
  }
  return keys;
}

export default function Calendar() {
  const { isAdmin } = useAuth();
  const [cursor, setCursor] = useState(() => new Date());
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { from, to } = monthRangeISO(year, month);
    try {
      const params = new URLSearchParams({
        from,
        to,
        limit: '500',
        page: '1',
      });
      const [aRes, lRes] = await Promise.all([
        api.get(`/api/attendance?${params.toString()}`),
        api.get(`/api/leaves?${params.toString()}`),
      ]);
      if (aRes.data.success) {
        setAttendance(aRes.data.data.items || []);
      } else {
        throw new Error(aRes.data.message || 'Failed to load attendance');
      }
      if (lRes.data.success) {
        setLeaves(lRes.data.data.items || []);
      } else {
        throw new Error(lRes.data.message || 'Failed to load leaves');
      }
    } catch (e) {
      const msg = e.message || 'Could not load calendar';
      setError(msg);
      setAttendance([]);
      setLeaves([]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const attByDay = useMemo(() => {
    const m = {};
    attendance.forEach((r) => {
      const key = apiDayKey(r.date);
      if (!key) return;
      if (!m[key]) m[key] = [];
      m[key].push(r);
    });
    return m;
  }, [attendance]);

  const leaveByDay = useMemo(() => {
    const m = {};
    leaves.forEach((lv) => {
      leaveDayKeys(lv.fromDate, lv.toDate).forEach((key) => {
        if (!m[key]) m[key] = [];
        if (!m[key].some((x) => x._id === lv._id)) m[key].push(lv);
      });
    });
    return m;
  }, [leaves]);

  const cells = useMemo(() => monthMatrix(year, month), [year, month]);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayKey = localDayKey(new Date());

  const selectedAtt = selectedDay ? attByDay[selectedDay] || [] : [];
  const selectedLeave = selectedDay ? leaveByDay[selectedDay] || [] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-accent font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Schedule
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin
              ? 'Org-wide attendance and leave — click a day for details.'
              : 'Your attendance and leave — click a day for details.'}
          </p>
        </motion.div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" type="button" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button variant="secondary" type="button" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {error && !loading && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
          <button type="button" className="ml-3 font-semibold underline" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <Card className="overflow-hidden !p-0">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center text-slate-500 shimmer-bg rounded-2xl"
          >
            Loading calendar…
          </motion.div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-accent font-bold uppercase tracking-wider text-slate-400 mb-2">
              {weekDays.map((w) => (
                <motion.div key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-2">
                  {w}
                </motion.div>
              ))}
            </div>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.01 } },
              }}
              className="grid grid-cols-7 gap-1"
            >
              {cells.map((day, i) => {
                const inMonth = day.getMonth() === month;
                const key = localDayKey(day);
                const attList = attByDay[key] || [];
                const lvList = leaveByDay[key] || [];
                const isToday = key === todayKey;
                const isSelected = key === selectedDay;
                const hasAtt = attList.length > 0;
                const hasLeave = lvList.length > 0;

                return (
                  <motion.button
                    key={`${key}-${i}`}
                    type="button"
                    variants={{
                      hidden: { opacity: 0, scale: 0.95 },
                      show: { opacity: 1, scale: 1 },
                    }}
                    onClick={() => inMonth && setSelectedDay(key)}
                    disabled={!inMonth}
                    className={`relative min-h-[72px] sm:min-h-[88px] rounded-xl border p-1.5 sm:p-2 text-left transition-all ${
                      inMonth
                        ? 'border-slate-200/80 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/30 hover:shadow-md hover:border-brand-300/40 cursor-pointer'
                        : 'border-transparent bg-slate-50/30 dark:bg-slate-900/10 opacity-40 cursor-default'
                    } ${isToday ? 'ring-2 ring-brand-500/50 shadow-glow-sm' : ''} ${
                      isSelected ? 'ring-2 ring-cyan-500/60 bg-brand-500/5' : ''
                    }`}
                  >
                    <span
                      className={`text-xs font-bold ${
                        isToday ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {hasAtt && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="mt-1 h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 origin-left"
                        title={
                          isAdmin
                            ? `${attList.length} attendance record(s)`
                            : attList[0]?.status || 'Present'
                        }
                      />
                    )}
                    {isAdmin && hasAtt && attList.length > 1 && (
                      <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white px-0.5">
                        {attList.length}
                      </span>
                    )}
                    {hasLeave && (
                      <motion.div className="mt-1 space-y-0.5">
                        {lvList.slice(0, 2).map((l) => (
                          <motion.div
                            key={`${l._id}-${key}`}
                            className={`truncate rounded-md px-1 py-0.5 text-[9px] font-semibold ${
                              l.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-100'
                                : l.status === 'rejected'
                                  ? 'bg-rose-500/20 text-rose-900 dark:text-rose-100'
                                  : 'bg-amber-500/20 text-amber-900 dark:text-amber-100'
                            }`}
                            title={`${l.leaveType} (${l.status})${l.employee?.fullName ? ` — ${l.employee.fullName}` : ''}`}
                          >
                            {isAdmin ? l.employee?.fullName?.split(' ')[0] || 'Leave' : l.leaveType?.split(' ')[0]}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        )}
      </Card>

      {!loading && attendance.length === 0 && leaves.length === 0 && !error && (
        <EmptyState
          title="No events this month"
          description={
            isAdmin
              ? 'Attendance and leave will appear here once employees check in or request time off.'
              : 'Check in from Attendance or apply for leave to see your schedule here.'
          }
        />
      )}

      {selectedDay && (
        <Card>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand-500" />
              {formatDate(selectedDay + 'T12:00:00')}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Close
            </button>
          </div>

          {selectedAtt.length === 0 && selectedLeave.length === 0 && (
            <p className="text-sm text-slate-500">No attendance or leave on this day.</p>
          )}

          {selectedAtt.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <p className="text-xs font-accent font-bold uppercase tracking-wider text-slate-400 mb-2">
                Attendance ({selectedAtt.length})
              </p>
              <ul className="space-y-2">
                {selectedAtt.map((r) => (
                  <li
                    key={r._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">
                      {isAdmin ? r.employee?.fullName || 'Employee' : 'You'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDateTime(r.checkIn)}
                      {r.checkOut ? ` → ${formatDateTime(r.checkOut)}` : ''}
                    </span>
                    <Badge variant={r.status === 'Late' ? 'warning' : r.status === 'Absent' ? 'danger' : 'success'}>
                      {r.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {selectedLeave.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs font-accent font-bold uppercase tracking-wider text-slate-400 mb-2">
                Leave ({selectedLeave.length})
              </p>
              <ul className="space-y-2">
                {selectedLeave.map((l) => (
                  <li
                    key={l._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {l.leaveType}
                        {isAdmin && l.employee?.fullName ? ` · ${l.employee.fullName}` : ''}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(l.fromDate)} – {formatDate(l.toDate)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'
                      }
                    >
                      {l.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </Card>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" /> Attendance
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-8 rounded-full bg-amber-400/80" /> Leave (pending)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-8 rounded-full bg-emerald-500/50" /> Leave (approved)
        </span>
      </div>
    </motion.div>
  );
}
