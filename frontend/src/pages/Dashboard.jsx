import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  UserCheck,
  Palmtree,
  Activity,
  UserMinus,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, StatCard, staggerContainer, staggerItem } from '../components/ui/Card.jsx';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';
import Badge from '../components/ui/Badge.jsx';
import ProgressBar from '../components/premium/ProgressBar.jsx';
import { formatDate } from '../utils/format.js';
import { mediaUrl } from '../utils/format.js';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const url = isAdmin ? '/api/dashboard/admin' : '/api/dashboard/employee';
        const { data: res } = await api.get(url);
        if (!cancelled && res.success) setData(res.data);
      } catch (e) {
        if (!cancelled) toast.error(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const attendanceRate = useMemo(() => {
    if (!data?.attendanceToday) return 0;
    const p = data.attendanceToday.present ?? 0;
    const a = data.attendanceToday.absent ?? 0;
    const t = p + a;
    if (!t) return 0;
    return Math.round((p / t) * 100);
  }, [data]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isAdmin && data) {
    const leaveMap = data.leaveByStatus || {};
    const chartData = (data.chartData || []).map((d) => ({
      ...d,
      label: d.date?.slice(5) || d.date,
    }));
    const recentN = data.recentEmployees?.length ?? 0;

    return (
      <div className="space-y-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Live workspace
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              People <span className="text-gradient">intelligence</span>
            </h2>
            <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Attendance, leave, and growth signals — distilled into one calm command surface.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <StatCard title="Total employees" value={data.totalEmployees} icon={Users} trend={`+${recentN} recent`} trendUp />
          <StatCard
            title="Present today"
            value={data.attendanceToday?.present ?? 0}
            icon={UserCheck}
            accent="from-emerald-500 to-teal-500"
            subtitle={`Late: ${data.attendanceToday?.late ?? 0}`}
          />
          <StatCard
            title="Absent (est.)"
            value={data.attendanceToday?.absent ?? 0}
            icon={UserMinus}
            accent="from-rose-500 to-orange-500"
          />
          <StatCard
            title="Pending leave"
            value={data.pendingLeaves}
            icon={Palmtree}
            accent="from-amber-500 to-amber-600"
          />
          <StatCard
            title="Active roster"
            value={data.activeEmployees}
            icon={Activity}
            accent="from-cyan-500 to-blue-600"
            trend="Healthy coverage"
            trendUp
          />
          <motion.div
            variants={staggerItem}
            className="rounded-2xl border border-white/60 dark:border-slate-700/50 bg-white/75 dark:bg-slate-900/55 backdrop-blur-xl p-5 shadow-card hover:shadow-lift transition-shadow"
          >
            <p className="text-xs font-accent font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly attendance rate</p>
            <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{attendanceRate}%</p>
            <p className="text-xs text-slate-500 mt-1 mb-3">Based on today&apos;s check-ins vs. active headcount</p>
            <ProgressBar value={attendanceRate} max={100} />
          </motion.div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card glow className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Attendance velocity</h3>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> 7 days
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} className="stroke-slate-300 dark:stroke-slate-600" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: '1px solid rgba(148,163,184,0.25)',
                      boxShadow: '0 12px 40px rgba(15,23,42,0.12)',
                    }}
                  />
                  <Area type="monotone" dataKey="present" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
                  <Area type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.12} fill="#f59e0b" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Leave pipeline</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Pending', value: leaveMap.pending || 0 },
                    { name: 'Approved', value: leaveMap.approved || 0 },
                    { name: 'Rejected', value: leaveMap.rejected || 0 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Recent hires</h3>
            <ul className="space-y-3">
              {(data.recentEmployees || []).map((e) => (
                <motion.li
                  key={e._id}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <div className="h-11 w-11 rounded-xl overflow-hidden bg-gradient-to-br from-brand-500 to-violet-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {e.profileImage ? (
                      <img src={mediaUrl(e.profileImage)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      e.fullName?.slice(0, 1)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{e.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {e.department} · {e.designation}
                    </p>
                  </div>
                  <Badge variant={e.status === 'active' ? 'success' : 'neutral'}>{e.status}</Badge>
                </motion.li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Leave inbox</h3>
            <ul className="space-y-3">
              {(data.recentLeaves || []).map((l) => (
                <li key={l._id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{l.employee?.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {l.leaveType} · {formatDate(l.fromDate)} – {formatDate(l.toDate)}
                    </p>
                  </div>
                  <Badge variant={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}>{l.status}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card glow>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Activity feed</h3>
          <ul className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
            {(data.recentActivity || []).map((a, idx) => (
              <li key={idx} className="py-3.5 flex items-center justify-between gap-4 text-sm first:pt-0">
                <span className="text-slate-700 dark:text-slate-200 leading-snug">{a.message}</span>
                <span className="text-xs text-slate-400 whitespace-nowrap font-medium">{formatDate(a.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  const emp = data?.employee;
  const today = data?.todayAttendance;

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-accent font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-2">Personal</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Your <span className="text-gradient">rhythm</span>
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-lg">Balance attendance momentum with time away — all in one glance.</p>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-3">
        <StatCard title="Department" value={emp?.department || '—'} numeric={false} subtitle={emp?.designation} accent="from-violet-500 to-indigo-600" />
        <StatCard
          title="Pending leaves"
          value={data?.pendingLeaves ?? 0}
          icon={Palmtree}
          accent="from-amber-500 to-orange-500"
        />
        <StatCard
          title="Today"
          value={today?.checkIn ? (today.checkOut ? 'Checked out' : 'Checked in') : 'Not checked in'}
          numeric={false}
          icon={UserCheck}
          accent="from-emerald-500 to-teal-500"
          subtitle={today?.status ? `Status: ${today.status}` : ''}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card glow>
          <h3 className="font-display font-bold text-lg mb-4 text-slate-900 dark:text-white">Last 2 weeks</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(data?.weekAttendance || []).map((a) => ({
                  day: new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
                  present: a.checkIn ? 1 : 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} domain={[0, 1]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="present" name="Present" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-display font-bold text-lg mb-4 text-slate-900 dark:text-white">Recent leave</h3>
          <ul className="space-y-3">
            {(data?.recentLeaves || []).map((l) => (
              <li key={l._id} className="flex justify-between gap-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 px-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{l.leaveType}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(l.fromDate)} – {formatDate(l.toDate)}
                  </p>
                </div>
                <Badge variant={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}>{l.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
