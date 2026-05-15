import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Badge from '../components/ui/Badge.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { formatDate } from '../utils/format.js';
import { mediaUrl } from '../utils/format.js';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  designation: '',
  role: 'Staff',
  joiningDate: '',
  salary: '',
  status: 'active',
};

export default function Employees() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 8 });
      if (search.trim()) params.set('search', search.trim());
      if (department.trim()) params.set('department', department.trim());
      const { data } = await api.get(`/api/employees?${params.toString()}`);
      if (data.success) {
        setItems(data.data.items);
        setTotal(data.data.total);
        setPages(data.data.pages);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, department]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      fullName: row.fullName,
      email: row.email,
      password: '',
      phone: row.phone || '',
      department: row.department,
      designation: row.designation,
      role: row.role || 'Staff',
      joiningDate: row.joiningDate?.slice(0, 10) || '',
      salary: String(row.salary ?? ''),
      status: row.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!editing && (!form.password || form.password.length < 6)) e.password = 'Min 6 characters';
    if (!form.department.trim()) e.department = 'Required';
    if (!form.designation.trim()) e.designation = 'Required';
    if (!form.joiningDate) e.joiningDate = 'Required';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        role: form.role,
        joiningDate: form.joiningDate,
        salary: form.salary,
        status: form.status,
      };
      if (form.password) payload.password = form.password;
      if (editing) {
        const { data } = await api.put(`/api/employees/${editing._id}`, payload);
        if (data.success) toast.success('Employee updated');
      } else {
        payload.password = form.password;
        const { data } = await api.post('/api/employees', payload);
        if (data.success) toast.success('Employee created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/employees/${deleteTarget._id}`);
      toast.success('Employee removed');
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'fullName',
      title: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-brand-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold">
            {row.profileImage ? (
              <img src={mediaUrl(row.profileImage)} alt="" className="h-full w-full object-cover" />
            ) : (
              row.fullName?.slice(0, 1)
            )}
          </div>
          <div>
            <p className="font-medium">{row.fullName}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', title: 'Department' },
    { key: 'designation', title: 'Designation' },
    {
      key: 'status',
      title: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : row.status === 'on_leave' ? 'warning' : 'neutral'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'joiningDate',
      title: 'Joined',
      render: (row) => formatDate(row.joiningDate),
    },
    {
      key: 'actions',
      title: '',
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <Link
            to={`/employees/${row._id}`}
            className="p-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 inline-flex"
            title="View profile"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"
            onClick={() => openEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Employees</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{total} people in directory</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add employee
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-900/70 py-2.5 pl-10 pr-3 text-sm"
            placeholder="Search name, email, department…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <input
          className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-900/70 px-3 py-2.5 text-sm lg:w-56"
          placeholder="Filter department"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          empty={
            <EmptyState title="No employees found" description="Adjust filters or add a new team member." action={<Button onClick={openCreate}>Add employee</Button>} />
          }
        />
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
            Page {page} of {pages}
          </span>
          <Button variant="secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit employee' : 'New employee'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={save}>
              Save
            </Button>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} error={formErrors.fullName} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={formErrors.email} />
          <Input
            label={editing ? 'New password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={formErrors.password}
          />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} error={formErrors.department} />
          <Input label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} error={formErrors.designation} />
          <Input label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Input label="Joining date" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} error={formErrors.joiningDate} />
          <Input label="Salary" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'on_leave', label: 'On leave' },
            ]}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove employee?"
        message="This permanently deletes the user account and HR record."
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
