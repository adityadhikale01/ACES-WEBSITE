import express from 'express';
import {
  getSystemStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from './adminController.js';
import { requireAdmin, requireSuperAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

// Stats accessible to all 3 Admin roles (Superadmin, Faculty, President)
router.get('/stats', requireAdmin, WrapAsync(getSystemStats));

// User role management strictly reserved to Superadmin
router.get('/users', requireSuperAdmin, WrapAsync(getAllUsers));
router.patch('/users/:id/role', requireSuperAdmin, WrapAsync(updateUserRole));
router.delete('/users/:id', requireSuperAdmin, WrapAsync(deleteUser));

export default router;
