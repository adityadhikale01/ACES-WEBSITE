import { Router } from 'express';
import {
  getEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  eventSchema,
} from '../controllers/eventsController.js';
import { authenticate, optionalAuth, requireEventAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', optionalAuth, getEvents);
router.get('/:slug', optionalAuth, getEventBySlug);

// Event Admin Endpoints (SUPER_ADMIN, ADMIN, PRESIDENT)
router.post('/', authenticate, requireEventAdmin, validate(eventSchema), createEvent);
router.put('/:id', authenticate, requireEventAdmin, validate(eventSchema.partial()), updateEvent);
router.delete('/:id', authenticate, requireEventAdmin, deleteEvent);

export default router;
