import { Router } from 'express';
import { getDashboard, getEmployeeDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/admin', getDashboard);
router.get('/employee', getEmployeeDashboard);

export default router;
