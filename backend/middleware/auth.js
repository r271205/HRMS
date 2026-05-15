import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies JWT and attaches req.user (id, role, employee id if any).
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token' });
  }
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    req.user = {
      id: user._id.toString(),
      role: user.role,
      employeeId: user.employee ? user.employee.toString() : null,
      email: user.email,
      avatar: user.avatar || '',
    };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized — invalid token' });
  }
});

/**
 * Restricts route to given roles.
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden — insufficient permissions' });
    }
    next();
  };
