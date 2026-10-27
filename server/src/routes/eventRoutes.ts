import { Router } from 'express';
import {
  getEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  eventSchema,
} from '../controllers/eventsController.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', optionalAuth, getEvents);
router.get('/:slug', optionalAuth, getEventBySlug);

// Admin-only endpoints
router.post('/', authenticate, requireAdmin, validate(eventSchema), createEvent);
router.put('/:id', authenticate, requireAdmin, validate(eventSchema.partial()), updateEvent);
router.delete('/:id', authenticate, requireAdmin, deleteEvent);

export default router;
