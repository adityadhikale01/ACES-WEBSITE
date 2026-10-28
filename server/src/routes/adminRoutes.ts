import { Router } from 'express';
import { getAdminStats, getAllUsers, updateUserRole } from '../controllers/adminController.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

// Stats overview accessible to Superadmin, Faculty, and President
router.get('/stats', authenticate, requireAdmin, getAdminStats);

// User Security Roles Management strictly restricted to Superadmin
router.get('/users', authenticate, requireSuperAdmin, getAllUsers);
router.patch('/users/:id', authenticate, requireSuperAdmin, updateUserRole);

export default router;
