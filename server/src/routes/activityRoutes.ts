import { Router } from 'express';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  activitySchema,
} from '../controllers/activitiesController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getActivities);

// Admin endpoints
router.post('/', authenticate, requireAdmin, validate(activitySchema), createActivity);
router.put('/:id', authenticate, requireAdmin, validate(activitySchema.partial()), updateActivity);
router.delete('/:id', authenticate, requireAdmin, deleteActivity);

export default router;
