import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * PATCH /api/profile/avatar — store image in MongoDB (works on Vercel; no disk writes).
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const mime = req.file.mimetype || 'image/jpeg';
  const dataUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.avatar = dataUrl;
  await user.save();

  if (user.employee) {
    await Employee.findByIdAndUpdate(user.employee, { profileImage: dataUrl });
  }

  res.json({
    success: true,
    data: { avatar: dataUrl },
  });
});
