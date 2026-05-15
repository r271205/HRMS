import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { signToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  let employee = null;
  if (user.employee) {
    employee = await Employee.findById(user.employee).lean();
  }
  const token = signToken({ id: user._id.toString(), role: user.role });
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        employeeId: user.employee,
        employee,
      },
    },
  });
});

/**
 * GET /api/auth/me — current user + employee profile
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  let employee = null;
  if (user.employee) {
    employee = await Employee.findById(user.employee).lean();
  }
  res.json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      employeeId: user.employee,
      employee,
    },
  });
});
