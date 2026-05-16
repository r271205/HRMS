import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * PATCH /api/profile/avatar
 * multipart/form-data
 * field name: image
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  // Check file exists
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Image file is required',
    });
  }

  // Convert image buffer to base64
  const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  // Find user
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Save image directly in database
  user.avatar = base64Image;

  await user.save();

  // Update employee profile image
  if (user.employee) {
    await Employee.updateOne(
      { _id: user.employee },
      {
        $set: {
          profileImage: base64Image,
        },
      }
    );
  }

  res.json({
    success: true,
    message: 'Profile image updated successfully',
    data: {
      avatar: user.avatar,
    },
  });
});