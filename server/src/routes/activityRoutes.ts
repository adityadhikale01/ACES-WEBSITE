import { Router } from 'express';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  activitySchema,
} from '../controllers/activitiesController.js';
import { authenticate, requireActivityAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getActivities);

// Faculty & Superadmin Endpoints (SUPER_ADMIN, ADMIN, FACULTY)
router.post('/', authenticate, requireActivityAdmin, validate(activitySchema), createActivity);
router.put('/:id', authenticate, requireActivityAdmin, validate(activitySchema.partial()), updateActivity);
router.delete('/:id', authenticate, requireActivityAdmin, deleteActivity);

export default router;
