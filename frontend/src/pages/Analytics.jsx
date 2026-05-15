import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/ui/Card.jsx';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#94a3b8'];

export default function Analytics() {
  const { isAdmin } = useAuth();
  const [dash, setDash] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [empDash, setEmpDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const [d, e] = await Promise.all([
            api.get('/api/dashboard/admin'),
            api.get('/api/employees?limit=200&page=1'),
          ]);
          if (!cancelled && d.data.success) setDash(d.data.data);
          if (!cancelled && e.data.success) setEmployees(e.data.data.items || []);
        } else {
          const d = await api.get('/api/dashboard/employee');
          if (!cancelled && d.data.success) setEmpDash(d.data.data);
        }
      } catch (err) {
        if (!cancelled) toast.error(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const deptData = useMemo(() => {
    const map = {};
    employees.forEach((em) => {
      const d = em.department || 'Other';
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [employees]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!isAdmin && empDash) {
    const week = (empDash.weekAttendance || []).map((a) => ({
      label: new Date(a.date).toLocaleDateString(undefined, { weekday: 'short' }),
      present: a.checkIn ? 1 : 0,
    }));
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-accent font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Personal</p>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Your analytics</h2>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-2">
          <Card glow>
            <h3 className="font-display font-semibold text-lg mb-4 text-slate-900 dark:text-white">Rhythm (14 days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={week}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} className="stroke-slate-400 dark:stroke-slate-600" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} domain={[0, 1]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="present" name="Present" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h3 className="font-display font-semibold text-lg mb-4">Leave mix</h3>
            <ul className="space-y-2 text-sm">
              {(empDash.recentLeaves || []).map((l) => (
                <li key={l._id} className="flex justify-between rounded-xl bg-slate-50/80 dark:bg-slate-800/50 px-3 py-2">
                  <span className="font-medium text-slate-800 dark:text-slate-100">{l.leaveType}</span>
                  <span className="text-slate-500 capitalize">{l.status}</span>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!dash) return null;

  const chartData = (dash.chartData || []).map((d) => ({ ...d, label: d.date?.slice(5) || d.date }));
  const leaveMap = dash.leaveByStatus || {};
  const leaveChartData = [
    { name: 'Pending', value: leaveMap.pending || 0 },
    { name: 'Approved', value: leaveMap.approved || 0 },
    { name: 'Rejected', value: leaveMap.rejected || 0 },
  ];
  const leaveColors = ['#f59e0b', '#10b981', '#f43f5e'];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-accent font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Insights</p>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Workforce analytics</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Attendance velocity, leave pipeline, and org structure.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="xl:col-span-2">
          <Card glow className="h-full">
            <h3 className="font-display font-semibold text-lg mb-2 text-slate-900 dark:text-white">Attendance trend</h3>
            <p className="text-xs text-slate-500 mb-4">Rolling 7-day check-in volume</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="a1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200/80 dark:stroke-slate-700/80" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.25)' }} />
                  <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={2} fill="url(#a1)" />
                  <Area type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.08} fill="#f59e0b" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <h3 className="font-display font-semibold text-lg mb-2 text-slate-900 dark:text-white">Departments</h3>
            <p className="text-xs text-slate-500 mb-2">Headcount by unit</p>
            <div className="h-64">
              {deptData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-slate-500">Add employees to see department mix.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2}>
                      {deptData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-display font-semibold text-lg mb-4">Leave outcomes</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {leaveChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={leaveColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-display font-semibold text-lg mb-4">Snapshot</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-brand-500/8 dark:bg-brand-500/10 p-3">
              <dt className="text-slate-500 text-xs">Employees</dt>
              <dd className="text-2xl font-display font-bold text-slate-900 dark:text-white">{dash.totalEmployees}</dd>
            </div>
            <div className="rounded-xl bg-emerald-500/8 p-3">
              <dt className="text-slate-500 text-xs">Present today</dt>
              <dd className="text-2xl font-display font-bold text-emerald-700 dark:text-emerald-300">{dash.attendanceToday?.present ?? 0}</dd>
            </div>
            <div className="rounded-xl bg-rose-500/8 p-3">
              <dt className="text-slate-500 text-xs">Absent (est.)</dt>
              <dd className="text-2xl font-display font-bold text-rose-700 dark:text-rose-300">{dash.attendanceToday?.absent ?? 0}</dd>
            </div>
            <div className="rounded-xl bg-amber-500/8 p-3">
              <dt className="text-slate-500 text-xs">Pending leave</dt>
              <dd className="text-2xl font-display font-bold text-amber-800 dark:text-amber-200">{dash.pendingLeaves}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
