import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Normalize "calendar day" for attendance (UTC midnight of local Y-M-D). */
export function getCalendarDateUTC(d = new Date()) {
  const x = new Date(d);
  return new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()));
}

function isLateNow() {
  const n = new Date();
  const h = n.getHours();
  const m = n.getMinutes();
  return h > 10 || (h === 10 && m > 0);
}

/**
 * POST /api/attendance/check-in
 */
export const checkIn = asyncHandler(async (req, res) => {
  if (req.user.role !== 'employee' || !req.user.employeeId) {
    return res.status(403).json({ success: false, message: 'Only employees can check in' });
  }
  const emp = await Employee.findById(req.user.employeeId);
  if (!emp || emp.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Employee not active' });
  }
  const day = getCalendarDateUTC();
  let record = await Attendance.findOne({ employee: emp._id, date: day });
  if (record && record.checkIn) {
    return res.status(400).json({ success: false, message: 'Already checked in today' });
  }
  const status = isLateNow() ? 'Late' : 'Present';
  if (!record) {
    record = await Attendance.create({
      employee: emp._id,
      user: req.user.id,
      date: day,
      checkIn: new Date(),
      status,
    });
  } else {
    record.checkIn = new Date();
    record.status = status;
    await record.save();
  }
  const populated = await Attendance.findById(record._id).populate('employee', 'fullName department');
  res.status(201).json({ success: true, data: populated });
});

/**
 * POST /api/attendance/check-out
 */
export const checkOut = asyncHandler(async (req, res) => {
  if (req.user.role !== 'employee' || !req.user.employeeId) {
    return res.status(403).json({ success: false, message: 'Only employees can check out' });
  }
  const day = getCalendarDateUTC();
  const record = await Attendance.findOne({ employee: req.user.employeeId, date: day });
  if (!record || !record.checkIn) {
    return res.status(400).json({ success: false, message: 'Check in first' });
  }
  if (record.checkOut) {
    return res.status(400).json({ success: false, message: 'Already checked out today' });
  }
  record.checkOut = new Date();
  await record.save();
  const populated = await Attendance.findById(record._id).populate('employee', 'fullName department');
  res.json({ success: true, data: populated });
});

/**
 * GET /api/attendance
 */
export const listAttendance = asyncHandler(async (req, res) => {
  const { employeeId, from, to, page = 1, limit = 15 } = req.query;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(500, Math.max(1, parseInt(limit, 10) || 15));

  const filter = {};
  if (req.user.role === 'employee') {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile' });
    }
    filter.employee = req.user.employeeId;
  } else if (employeeId) {
    filter.employee = employeeId;
  }
  if (from || to) {
    filter.date = {};
    if (from) {
      const f = new Date(from);
      if (!Number.isNaN(f.getTime())) filter.date.$gte = f;
    }
    if (to) {
      const t = new Date(to);
      if (!Number.isNaN(t.getTime())) filter.date.$lte = t;
    }
  }

  const total = await Attendance.countDocuments(filter);
  const items = await Attendance.find(filter)
    .populate('employee', 'fullName email department designation profileImage')
    .sort({ date: -1 })
    .skip((p - 1) * l)
    .limit(l)
    .lean();

  res.json({
    success: true,
    data: { items, total, page: p, pages: Math.ceil(total / l) || 1 },
  });
});

/**
 * GET /api/attendance/summary/today — dashboard widget
 */
export const todaySummary = asyncHandler(async (req, res) => {
  const day = getCalendarDateUTC();
  const filter = { date: day };
  const items = await Attendance.find(filter).populate('employee', 'fullName department').lean();
  let present = 0;
  let absent = 0;
  let late = 0;
  for (const a of items) {
    if (a.status === 'Late') late++;
    else if (a.status === 'Present' || (a.checkIn && a.status !== 'Absent')) present++;
  }
  /** Employees with no record today counted absent for summary (optional heuristic) */
  const activeCount = await Employee.countDocuments({ status: 'active' });
  const marked = items.filter((i) => i.checkIn).length;
  absent = Math.max(0, activeCount - marked);

  res.json({
    success: true,
    data: {
      date: day,
      totalPresent: present + late,
      totalLate: late,
      totalAbsent: absent,
      records: items,
    },
  });
});
