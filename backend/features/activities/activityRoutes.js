import express from 'express';
import {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from './activityController.js';
import { validateActivity } from './validateActivity.js';
import { requireActivityAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/', WrapAsync(getAllActivities));

// Admin routes (Superadmin, Faculty)
router.post('/', requireActivityAdmin, validateActivity, WrapAsync(createActivity));
router.put('/:id', requireActivityAdmin, validateActivity, WrapAsync(updateActivity));
router.delete('/:id', requireActivityAdmin, WrapAsync(deleteActivity));

export default router;
