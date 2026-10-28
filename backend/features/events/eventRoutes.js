import express from 'express';
import {
  getAllEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
} from './eventController.js';
import { validateCreateEvent, validateUpdateEvent } from './validateEvent.js';
import { requireEventAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/', WrapAsync(getAllEvents));
router.get('/:slug', WrapAsync(getEventBySlug));

// Admin routes restricted to Superadmin and President
router.post('/', requireEventAdmin, validateCreateEvent, WrapAsync(createEvent));
router.put('/:id', requireEventAdmin, validateUpdateEvent, WrapAsync(updateEvent));
router.delete('/:id', requireEventAdmin, WrapAsync(deleteEvent));

export default router;
