import { Router } from 'express';
import {
  checkIn,
  checkOut,
  listAttendance,
  todaySummary,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/summary/today', authorize('admin'), todaySummary);
router.get('/', listAttendance);

export default router;
