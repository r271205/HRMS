import { Router } from 'express';
import {
  applyLeave,
  listLeaves,
  approveLeave,
  rejectLeave,
  leaveStats,
} from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/stats/summary', authorize('admin'), leaveStats);
router.post('/', applyLeave);
router.get('/', listLeaves);
router.patch('/:id/approve', authorize('admin'), approveLeave);
router.patch('/:id/reject', authorize('admin'), rejectLeave);

export default router;
