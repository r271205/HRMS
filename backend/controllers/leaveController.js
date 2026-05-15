import Leave, { LEAVE_TYPES } from '../models/Leave.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/leaves
 */
export const applyLeave = asyncHandler(async (req, res) => {
  if (req.user.role !== 'employee' || !req.user.employeeId) {
    return res.status(403).json({ success: false, message: 'Only employees can apply for leave' });
  }
  const { leaveType, fromDate, toDate, reason } = req.body;
  if (!leaveType || !fromDate || !toDate || !reason) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (!LEAVE_TYPES.includes(leaveType)) {
    return res.status(400).json({ success: false, message: 'Invalid leave type' });
  }
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid dates' });
  }
  if (to < from) {
    return res.status(400).json({ success: false, message: 'End date must be on or after start date' });
  }
  const leave = await Leave.create({
    employee: req.user.employeeId,
    leaveType,
    fromDate: from,
    toDate: to,
    reason: String(reason).trim(),
    status: 'pending',
  });
  const populated = await Leave.findById(leave._id).populate('employee', 'fullName department email');
  res.status(201).json({ success: true, data: populated });
});

/**
 * GET /api/leaves
 */
export const listLeaves = asyncHandler(async (req, res) => {
  const { status, employeeId, from, to, page = 1, limit = 12 } = req.query;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(500, Math.max(1, parseInt(limit, 10) || 12));

  const filter = {};
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    filter.status = status;
  }
  if (req.user.role === 'employee') {
    if (!req.user.employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile' });
    }
    filter.employee = req.user.employeeId;
  } else if (employeeId) {
    filter.employee = employeeId;
  }

  /** Overlaps visible month: leave starts on/before month end AND ends on/after month start */
  if (from && to) {
    const monthStart = new Date(from);
    const monthEnd = new Date(to);
    if (!Number.isNaN(monthStart.getTime()) && !Number.isNaN(monthEnd.getTime())) {
      filter.$and = [
        { fromDate: { $lte: monthEnd } },
        { toDate: { $gte: monthStart } },
      ];
    }
  }

  const total = await Leave.countDocuments(filter);
  const items = await Leave.find(filter)
    .populate('employee', 'fullName email department designation profileImage')
    .populate('reviewedBy', 'email role')
    .sort({ createdAt: -1 })
    .skip((p - 1) * l)
    .limit(l)
    .lean();

  res.json({
    success: true,
    data: { items, total, page: p, pages: Math.ceil(total / l) || 1 },
  });
});

/**
 * PATCH /api/leaves/:id/approve
 */
export const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave request not found' });
  }
  if (leave.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Leave already processed' });
  }
  leave.status = 'approved';
  leave.reviewedBy = req.user.id;
  leave.reviewNote = (req.body.reviewNote || '').trim();
  await leave.save();
  const populated = await Leave.findById(leave._id)
    .populate('employee', 'fullName email department')
    .populate('reviewedBy', 'email');
  res.json({ success: true, data: populated });
});

/**
 * PATCH /api/leaves/:id/reject
 */
export const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave request not found' });
  }
  if (leave.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Leave already processed' });
  }
  leave.status = 'rejected';
  leave.reviewedBy = req.user.id;
  leave.reviewNote = (req.body.reviewNote || '').trim();
  await leave.save();
  const populated = await Leave.findById(leave._id)
    .populate('employee', 'fullName email department')
    .populate('reviewedBy', 'email');
  res.json({ success: true, data: populated });
});

/**
 * GET /api/leaves/stats/summary
 */
export const leaveStats = asyncHandler(async (req, res) => {
  const [pending, approved, rejected] = await Promise.all([
    Leave.countDocuments({ status: 'pending' }),
    Leave.countDocuments({ status: 'approved' }),
    Leave.countDocuments({ status: 'rejected' }),
  ]);
  const byType = await Leave.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$leaveType', count: { $sum: 1 } } },
  ]);
  res.json({
    success: true,
    data: { pending, approved, rejected, byType },
  });
});
