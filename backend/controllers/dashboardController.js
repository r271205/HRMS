import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { getCalendarDateUTC } from './attendanceController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/dashboard — aggregated metrics for admin dashboard
 */
export const getDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }

  const today = getCalendarDateUTC();
  const weekAgo = new Date(today);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 6);

  const [
    totalEmployees,
    activeEmployees,
    pendingLeaves,
    recentEmployees,
    recentLeaves,
    attendanceWeek,
    todayAttendance,
    leaveByStatus,
  ] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'active' }),
    Leave.countDocuments({ status: 'pending' }),
    Employee.find().sort({ createdAt: -1 }).limit(5).populate('user', 'email avatar').lean(),
    Leave.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('employee', 'fullName department profileImage')
      .lean(),
    Attendance.find({ date: { $gte: weekAgo, $lte: today } })
      .sort({ date: 1 })
      .lean(),
    Attendance.find({ date: today }).lean(),
    Leave.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const adminUsers = await User.countDocuments({ role: 'admin' });

  /** Build chart series: last 7 days present / late / absent heuristic */
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const chartData = days.map((dayStr) => {
    const dayStart = new Date(dayStr + 'T00:00:00.000Z');
    const recs = attendanceWeek.filter((a) => new Date(a.date).toISOString().slice(0, 10) === dayStr);
    let late = 0;
    let present = 0;
    recs.forEach((r) => {
      if (r.status === 'Late') late++;
      if (r.checkIn) present++;
    });
    return {
      date: dayStr,
      present,
      late,
      marked: recs.length,
    };
  });

  let presentToday = 0;
  let lateToday = 0;
  todayAttendance.forEach((a) => {
    if (a.status === 'Late') lateToday++;
    if (a.checkIn) presentToday++;
  });
  const absentToday = Math.max(0, activeEmployees - todayAttendance.filter((a) => a.checkIn).length);

  const activity = [];
  recentLeaves.forEach((l) => {
    activity.push({
      type: 'leave',
      message: `${l.employee?.fullName || 'Employee'} — ${l.leaveType} (${l.status})`,
      at: l.updatedAt || l.createdAt,
    });
  });
  recentEmployees.forEach((e) => {
    activity.push({
      type: 'employee',
      message: `New employee: ${e.fullName} (${e.department})`,
      at: e.createdAt,
    });
  });
  activity.sort((a, b) => new Date(b.at) - new Date(a.at));
  const recentActivity = activity.slice(0, 10);

  res.json({
    success: true,
    data: {
      totalEmployees,
      activeEmployees,
      adminUsers,
      pendingLeaves,
      attendanceToday: {
        present: presentToday,
        late: lateToday,
        absent: absentToday,
      },
      leaveByStatus: leaveByStatus.reduce((acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {}),
      recentEmployees,
      recentLeaves,
      chartData,
      recentActivity,
    },
  });
});

/**
 * GET /api/dashboard/employee — lighter dashboard for employee role
 */
export const getEmployeeDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'employee' || !req.user.employeeId) {
    return res.status(403).json({ success: false, message: 'Employee only' });
  }
  const emp = await Employee.findById(req.user.employeeId).lean();
  const today = getCalendarDateUTC();
  const weekAgo = new Date(today);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 13);

  const [todayAtt, weekAtt, leaves] = await Promise.all([
    Attendance.findOne({ employee: req.user.employeeId, date: today }).lean(),
    Attendance.find({ employee: req.user.employeeId, date: { $gte: weekAgo, $lte: today } })
      .sort({ date: 1 })
      .lean(),
    Leave.find({ employee: req.user.employeeId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const pendingLeaves = await Leave.countDocuments({ employee: req.user.employeeId, status: 'pending' });

  res.json({
    success: true,
    data: {
      employee: emp,
      todayAttendance: todayAtt,
      weekAttendance: weekAtt,
      recentLeaves: leaves,
      pendingLeaves,
    },
  });
});
