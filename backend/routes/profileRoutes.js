import { Router } from 'express';
import { updateAvatar } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { uploadProfileImage } from '../middleware/upload.js';

const router = Router();

router.patch('/avatar', protect, uploadProfileImage.single('image'), updateAvatar);

export default router;
