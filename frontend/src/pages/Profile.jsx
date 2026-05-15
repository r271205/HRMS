import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Camera, Briefcase, Award, Clock } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Badge from '../components/ui/Badge.jsx';
import { formatDate } from '../utils/format.js';
import { mediaUrl } from '../utils/format.js';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const emp = user?.employee;
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      await api.patch('/api/profile/avatar', fd);
      toast.success('Profile photo updated');
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const avatar = mediaUrl(user?.avatar || emp?.profileImage);

  const timeline = emp
    ? [
        { icon: Briefcase, title: 'Joined team', desc: formatDate(emp.joiningDate) },
        { icon: Award, title: 'Current role', desc: `${emp.designation} · ${emp.department}` },
        { icon: Clock, title: 'Account', desc: user?.email },
      ]
    : [{ icon: Clock, title: 'Administrator', desc: user?.email || '' }];

  return (
    <div className="max-w-3xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-accent font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">Identity</p>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Your presence across Nexus HR — polished like a consumer profile.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="overflow-hidden rounded-2xl border border-white/60 dark:border-slate-700/50 bg-white/75 dark:bg-slate-900/50 shadow-lift backdrop-blur-xl"
      >
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-brand-600 via-violet-600 to-cyan-500">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,white,transparent_45%)]" />
        </div>
        <div className="relative px-6 pb-6 -mt-16 flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="relative">
            <div className="h-32 w-32 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white flex items-center justify-center text-4xl font-display font-bold">
              {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : (emp?.fullName || user?.email || '?').slice(0, 1).toUpperCase()}
            </div>
            <label className="absolute -bottom-1 -right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/60 bg-white dark:bg-slate-800 shadow-lg hover:scale-105 transition-transform">
              <Camera className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
            </label>
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{emp?.fullName || user?.email}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="neutral">
                <span className="capitalize">{user?.role}</span>
              </Badge>
              {emp?.status && <Badge variant="success">{emp.status}</Badge>}
            </div>
            <Button loading={uploading} variant="secondary" className="mt-4" type="button" onClick={() => fileRef.current?.click()}>
              Update photo
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4">
        {timeline.map((row, i) => (
          <motion.div key={row.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05 }}>
            <Card className="h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3">
                <row.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="text-xs font-accent font-bold uppercase tracking-wider text-slate-400">{row.title}</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white text-sm leading-snug">{row.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {emp && (
        <Card glow>
          <h3 className="font-display font-bold text-lg mb-4 text-slate-900 dark:text-white">HR record</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Phone" value={emp.phone || '—'} readOnly className="opacity-90" />
            <Input label="Department" value={emp.department} readOnly className="opacity-90" />
            <Input label="Designation" value={emp.designation} readOnly className="opacity-90" />
            <Input label="Role" value={emp.role} readOnly className="opacity-90" />
            <Input label="Joining date" value={formatDate(emp.joiningDate)} readOnly className="opacity-90" />
            <Input label="Salary" value={emp.salary != null ? String(emp.salary) : '—'} readOnly className="opacity-90" />
          </div>
        </Card>
      )}

      {!emp && user?.role === 'admin' && (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Admin accounts are not linked to an employee HR record. Your avatar still powers the workspace chrome — keep it sharp.
          </p>
        </Card>
      )}
    </div>
  );
}
