import express from 'express';
import {
  getAllEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventPoster,
  uploadPaymentQr,
} from './eventController.js';
import { validateCreateEvent, validateUpdateEvent } from './validateEvent.js';
import { requireEventAdmin } from '../../middleware/authMiddleware.js';
import { imageUpload } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/', WrapAsync(getAllEvents));
router.get('/:slug', WrapAsync(getEventBySlug));

// Admin routes restricted to Superadmin, Admin and President
router.post('/upload-poster', requireEventAdmin, imageUpload.any(), WrapAsync(uploadEventPoster));
router.post('/upload-payment-qr', requireEventAdmin, imageUpload.any(), WrapAsync(uploadPaymentQr));
router.post('/', requireEventAdmin, validateCreateEvent, WrapAsync(createEvent));
router.put('/:id', requireEventAdmin, validateUpdateEvent, WrapAsync(updateEvent));
router.delete('/:id', requireEventAdmin, WrapAsync(deleteEvent));

export default router;
