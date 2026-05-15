import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LogIn, LogOut } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Badge from '../components/ui/Badge.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import Select from '../components/ui/Select.jsx';
import { formatDate, formatDateTime } from '../utils/format.js';
import { emitHrmsNotification } from '../context/AppUiContext.jsx';

export default function Attendance() {
  const { isAdmin, isEmployee } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [employeeId, setEmployeeId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [employees, setEmployees] = useState([]);
  const [acting, setActing] = useState(false);

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
      const params = new URLSearchParams({ page, limit: 12 });
      if (isAdmin && employeeId) params.set('employeeId', employeeId);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const { data } = await api.get(`/api/attendance?${params.toString()}`);
      if (data.success) {
        setItems(data.data.items);
        setPages(data.data.pages);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, employeeId, from, to, isAdmin]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = async () => {
    setActing(true);
    try {
      await api.post('/api/attendance/check-in');
      toast.success('Checked in');
      emitHrmsNotification({ title: 'Checked in', body: 'Your attendance was recorded.', type: 'success' });
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(false);
    }
  };

  const checkOut = async () => {
    setActing(true);
    try {
      await api.post('/api/attendance/check-out');
      toast.success('Checked out');
      emitHrmsNotification({ title: 'Checked out', body: 'Have a great rest of your day.', type: 'success' });
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActing(false);
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
    {
      key: 'date',
      title: 'Date',
      render: (row) => formatDate(row.date),
    },
    {
      key: 'checkIn',
      title: 'Check-in',
      render: (row) => formatDateTime(row.checkIn),
    },
    {
      key: 'checkOut',
      title: 'Check-out',
      render: (row) => formatDateTime(row.checkOut),
    },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'Late' ? 'warning' : row.status === 'Absent' ? 'danger' : 'success'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isEmployee ? 'Mark your day and review history.' : 'Monitor attendance across the organization.'}
          </p>
        </div>
        {isEmployee && (
          <div className="flex gap-2">
            <Button loading={acting} onClick={checkIn}>
              <LogIn className="h-4 w-4" />
              Check in
            </Button>
            <Button variant="secondary" loading={acting} onClick={checkOut}>
              <LogOut className="h-4 w-4" />
              Check out
            </Button>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="grid md:grid-cols-4 gap-3">
          <Select
            label="Employee"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              setPage(1);
            }}
            options={[{ value: '', label: 'All employees' }, ...employees.map((e) => ({ value: e._id, label: e.fullName }))]}
          />
          <Input label="From" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          <Input label="To" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          empty={<EmptyState title="No attendance records" description="Records appear when employees check in." />}
        />
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="px-3 py-2 text-sm text-slate-600">Page {page}</span>
          <Button variant="secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
