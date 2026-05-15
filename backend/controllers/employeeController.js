import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const allowedStatus = ['active', 'inactive', 'on_leave'];

const validateEmployeePayload = (body, isUpdate = false) => {
  const errors = [];
  const required = ['fullName', 'email', 'department', 'designation', 'joiningDate'];
  if (!isUpdate) {
    required.push('password');
  }
  for (const key of required) {
    if (!isUpdate && body[key] === undefined) {
      errors.push(`${key} is required`);
    }
  }
  if (body.email && !/^\S+@\S+\.\S+$/.test(body.email)) {
    errors.push('Invalid email format');
  }
  if (body.password && body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (body.status && !allowedStatus.includes(body.status)) {
    errors.push('Invalid status');
  }
  if (body.salary !== undefined && body.salary !== '' && Number(body.salary) < 0) {
    errors.push('Salary cannot be negative');
  }
  return errors;
};

/**
 * GET /api/employees — admin: all with filters; employee: own record only
 */
export const listEmployees = asyncHandler(async (req, res) => {
  const { search, department, page = 1, limit = 10, status } = req.query;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  if (req.user.role === 'employee') {
    if (!req.user.employeeId) {
      return res.status(404).json({ success: false, message: 'Employee profile not linked' });
    }
    const emp = await Employee.findById(req.user.employeeId).populate('user', 'email role avatar');
    return res.json({
      success: true,
      data: { items: emp ? [emp] : [], total: emp ? 1 : 0, page: 1, pages: 1 },
    });
  }

  const filter = {};
  if (department) filter.department = new RegExp(department, 'i');
  if (status && allowedStatus.includes(status)) filter.status = status;
  if (search) {
    filter.$or = [
      { fullName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { department: new RegExp(search, 'i') },
    ];
  }

  const total = await Employee.countDocuments(filter);
  const items = await Employee.find(filter)
    .populate('user', 'email role avatar')
    .sort({ createdAt: -1 })
    .skip((p - 1) * l)
    .limit(l)
    .lean();

  res.json({
    success: true,
    data: {
      items,
      total,
      page: p,
      pages: Math.ceil(total / l) || 1,
    },
  });
});

/**
 * GET /api/employees/:id
 */
export const getEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id).populate('user', 'email role avatar');
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  if (req.user.role === 'employee' && req.user.employeeId !== emp._id.toString()) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  res.json({ success: true, data: emp });
});

/**
 * POST /api/employees — admin only (enforced in routes)
 */
export const createEmployee = asyncHandler(async (req, res) => {
  const errors = validateEmployeePayload(req.body, false);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join('; ') });
  }

  const {
    fullName,
    email,
    password,
    phone,
    department,
    designation,
    role,
    joiningDate,
    salary,
    status,
    profileImage,
  } = req.body;

  const emailNorm = email.toLowerCase().trim();
  const exists = await User.findOne({ email: emailNorm });
  if (exists) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.create(
      [
        {
          email: emailNorm,
          password: hashed,
          role: 'employee',
          avatar: '',
        },
      ],
      { session }
    );
    const u = user[0];
    const employee = await Employee.create(
      [
        {
          user: u._id,
          fullName: fullName.trim(),
          email: emailNorm,
          phone: phone || '',
          department: department.trim(),
          designation: designation.trim(),
          role: (role || 'Staff').trim(),
          joiningDate: new Date(joiningDate),
          salary: salary !== undefined && salary !== '' ? Number(salary) : 0,
          profileImage: profileImage || '',
          status: status && allowedStatus.includes(status) ? status : 'active',
        },
      ],
      { session }
    );
    const e = employee[0];
    u.employee = e._id;
    await u.save({ session });
    await session.commitTransaction();
    const populated = await Employee.findById(e._id).populate('user', 'email role avatar').lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

/**
 * PUT /api/employees/:id
 */
export const updateEmployee = asyncHandler(async (req, res) => {
  const errors = validateEmployeePayload(req.body, true);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join('; ') });
  }

  const emp = await Employee.findById(req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const {
    fullName,
    email,
    password,
    phone,
    department,
    designation,
    role,
    joiningDate,
    salary,
    status,
    profileImage,
  } = req.body;

  if (email) {
    const emailNorm = email.toLowerCase().trim();
    const clash = await User.findOne({ email: emailNorm, _id: { $ne: emp.user } });
    if (clash) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    emp.email = emailNorm;
    await User.updateOne({ _id: emp.user }, { $set: { email: emailNorm } });
  }
  if (fullName !== undefined) emp.fullName = fullName.trim();
  if (phone !== undefined) emp.phone = phone;
  if (department !== undefined) emp.department = department.trim();
  if (designation !== undefined) emp.designation = designation.trim();
  if (role !== undefined) emp.role = role.trim();
  if (joiningDate !== undefined) emp.joiningDate = new Date(joiningDate);
  if (salary !== undefined && salary !== '') emp.salary = Number(salary);
  if (status !== undefined && allowedStatus.includes(status)) emp.status = status;
  if (profileImage !== undefined) emp.profileImage = profileImage;

  if (password && password.length >= 6) {
    const hashed = await bcrypt.hash(password, 12);
    await User.updateOne({ _id: emp.user }, { $set: { password: hashed } });
  }

  await emp.save();
  const out = await Employee.findById(emp._id).populate('user', 'email role avatar');
  res.json({ success: true, data: out });
});

/**
 * DELETE /api/employees/:id — removes employee + user account
 */
export const deleteEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Employee.deleteOne({ _id: emp._id }, { session });
    await User.deleteOne({ _id: emp.user }, { session });
    await session.commitTransaction();
    res.json({ success: true, message: 'Employee removed' });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});
