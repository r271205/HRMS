import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Calendar, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import { formatDate } from '../utils/format.js';
import { mediaUrl } from '../utils/format.js';
import { CardSkeleton } from '../components/ui/Skeleton.jsx';

export default function EmployeeProfile() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isAdmin) {
        setForbidden(true);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get(`/api/employees/${id}`);
        if (!cancelled && data.success) setEmp(data.data);
      } catch {
        if (!cancelled) toast.error('Could not load profile');
        if (!cancelled) setForbidden(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isAdmin]);

  if (!isAdmin || forbidden) return <Navigate to="/employees" replace />;
  if (loading)
    return (
      <div className="max-w-4xl space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  if (!emp) return null;

  const img = mediaUrl(emp.profileImage);
  const timeline = [
    { label: 'Joined organization', date: emp.joiningDate, icon: Calendar },
    { label: 'HR record synced', date: emp.updatedAt || emp.createdAt, icon: UserCircle },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <Link to="/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to directory
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-white/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/60 shadow-lift backdrop-blur-xl">
        <div className="relative h-36 sm:h-44 bg-gradient-to-br from-brand-600 via-violet-600 to-cyan-600">
          <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] " />
        </div>
        <div className="relative px-6 pb-6 -mt-14 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="h-28 w-28 rounded-2xl ring-4 ring-white dark:ring-slate-900 shadow-xl overflow-hidden bg-gradient-to-br from-brand-500 to-violet-600 text-white flex items-center justify-center text-3xl font-display font-bold shrink-0">
            {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : emp.fullName?.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{emp.fullName}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{emp.designation} · {emp.department}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={emp.status === 'active' ? 'success' : 'neutral'}>{emp.status}</Badge>
              <Badge variant="info">{emp.role}</Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-accent font-bold uppercase text-slate-400">Email</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{emp.email}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-accent font-bold uppercase text-slate-400">Phone</p>
              <p className="font-medium text-slate-900 dark:text-white">{emp.phone || '—'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-accent font-bold uppercase text-slate-400">Salary</p>
              <p className="font-medium text-slate-900 dark:text-white">{emp.salary != null ? `$${Number(emp.salary).toLocaleString()}` : '—'}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-display font-bold text-lg mb-6 text-slate-900 dark:text-white">Activity timeline</h2>
        <ul className="space-y-0">
          {timeline.map((row, i) => (
            <li key={row.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400">
                  <row.icon className="h-4 w-4" />
                </div>
                {i < timeline.length - 1 && <div className="w-px flex-1 min-h-[2rem] bg-gradient-to-b from-brand-500/30 to-transparent mt-1" />}
              </div>
              <div className="pb-6">
                <p className="font-semibold text-slate-900 dark:text-white">{row.label}</p>
                <p className="text-sm text-slate-500">{formatDate(row.date)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
