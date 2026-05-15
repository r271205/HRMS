import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { formatDate } from '../utils/format.js';
import { emitHrmsNotification } from '../context/AppUiContext.jsx';

const LEAVE_TYPES = [
  { value: 'Sick Leave', label: 'Sick Leave' },
  { value: 'Casual Leave', label: 'Casual Leave' },
  { value: 'Paid Leave', label: 'Paid Leave' },
];

export default function Leaves() {
  const { isAdmin, isEmployee } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [empFilter, setEmpFilter] = useState('');
  const [stats, setStats] = useState(null);

  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState({ leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadStats = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get('/api/leaves/stats/summary');
      if (data.success) setStats(data.data);
    } catch {
      /* ignore */
    }
  }, [isAdmin]);

  const loadEmployees = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get('/api/employees?limit=100&page=1');
      if (data.success) setEmployees(data.data.items);
    } catch {
      /* ignore */
    }
  }, [isAdmin]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.set('status', statusFilter);
      if (isAdmin && empFilter) params.set('employeeId', empFilter);
      const { data } = await api.get(`/api/leaves?${params.toString()}`);
      if (data.success) {
        setItems(data.data.items);
        setPages(data.data.pages);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, empFilter, isAdmin]);

  useEffect(() => {
    loadStats();
    loadEmployees();
  }, [loadStats, loadEmployees]);

  useEffect(() => {
    load();
  }, [load]);

  const validate = () => {
    const e = {};
    if (!form.fromDate) e.fromDate = 'Required';
    if (!form.toDate) e.toDate = 'Required';
    if (!form.reason.trim()) e.reason = 'Required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitLeave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/api/leaves', form);
      toast.success('Leave request submitted');
      emitHrmsNotification({
        title: 'Leave submitted',
        body: 'Your request is pending admin review.',
        type: 'info',
      });
      setApplyOpen(false);
      setForm({ leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '' });
      load();
      loadStats();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const approve = async (id) => {
    try {
      await api.patch(`/api/leaves/${id}/approve`, {});
      toast.success('Leave approved');
      emitHrmsNotification({ title: 'Leave approved', body: 'The request was approved.', type: 'success' });
      load();
      loadStats();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const reject = async (id) => {
    try {
      await api.patch(`/api/leaves/${id}/reject`, {});
      toast.success('Leave rejected');
      emitHrmsNotification({ title: 'Leave rejected', body: 'The request was rejected.', type: 'warning' });
      load();
      loadStats();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const columns = [
    {
      key: 'employee',
      title: 'Employee',
      render: (row) => (
        <div>
          <p className="font-medium">{row.employee?.fullName || '—'}</p>
          <p className="text-xs text-slate-500">{row.employee?.department}</p>
        </div>
      ),
    },
    { key: 'leaveType', title: 'Type' },
    {
      key: 'dates',
      title: 'Dates',
      render: (row) => (
        <span className="text-sm">
          {formatDate(row.fromDate)} → {formatDate(row.toDate)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (row) =>
        isAdmin && row.status === 'pending' ? (
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="p-2 rounded-lg bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"
              onClick={() => approve(row._id)}
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg bg-red-500/15 text-red-700 hover:bg-red-500/25"
              onClick={() => reject(row._id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Leave</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Streamlined requests and approvals.</p>
        </div>
        {isEmployee && (
          <Button onClick={() => setApplyOpen(true)}>Apply for leave</Button>
        )}
      </div>

      {isAdmin && stats && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.approved}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="grid md:grid-cols-3 gap-3">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
          <Select
            label="Employee"
            value={empFilter}
            onChange={(e) => {
              setEmpFilter(e.target.value);
              setPage(1);
            }}
            options={[{ value: '', label: 'All' }, ...employees.map((e) => ({ value: e._id, label: e.fullName }))]}
          />
        </div>
      )}

      {!isAdmin && (
        <Select
          label="Filter status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          empty={<EmptyState title="No leave records" description="Submit a request to see it here." />}
        />
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button variant="secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <Modal
        open={applyOpen}
        title="Apply for leave"
        onClose={() => setApplyOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button loading={submitting} onClick={submitLeave}>
              Submit
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Leave type" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} options={LEAVE_TYPES} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="From" type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} error={formErrors.fromDate} />
            <Input label="To" type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} error={formErrors.toDate} />
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Reason</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-900/80 px-4 py-2.5 text-sm min-h-[100px]"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
            {formErrors.reason && <p className="text-xs text-red-500 mt-1">{formErrors.reason}</p>}
          </label>
        </div>
      </Modal>
    </div>
  );
}
