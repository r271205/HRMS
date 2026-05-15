import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadsPublicPath } from '../middleware/upload.js';

/**
 * PATCH /api/profile/avatar — multipart file field: image
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image file is required' });
  }
  const relative = `${uploadsPublicPath.replace(/^\//, '')}/${req.file.filename}`.replace(/\\/g, '/');
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (user.avatar && user.avatar.includes('/uploads/')) {
    const oldName = path.basename(user.avatar);
    const oldPath = path.join(process.cwd(), 'uploads', oldName);
    try {
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    } catch {
      /* ignore */
    }
  }
  user.avatar = `/${relative}`;
  await user.save();
  if (user.employee) {
    await Employee.updateOne({ _id: user.employee }, { $set: { profileImage: `/${relative}` } });
  }
  res.json({
    success: true,
    data: { avatar: user.avatar },
  });
});
