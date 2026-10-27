import { Router } from 'express';
import { getAdminStats, getAllUsers, updateUserRole } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUserRole);

export default router;
