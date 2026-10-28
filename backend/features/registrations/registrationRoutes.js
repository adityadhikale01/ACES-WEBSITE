import express from 'express';
import {
  registerForEvent,
  getMyRegistrations,
  getEventAttendees,
  updateAttendance,
  exportAttendeesCSV,
} from './registrationController.js';
import { validateCreateRegistration, validateUpdateAttendance } from './validateRegistration.js';
import { authMiddleware, requireEventAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.post('/', authMiddleware, validateCreateRegistration, WrapAsync(registerForEvent));
router.get('/my', authMiddleware, WrapAsync(getMyRegistrations));

// Admin routes
router.get('/event/:eventId', requireEventAdmin, WrapAsync(getEventAttendees));
router.get('/event/:eventId/export', requireEventAdmin, WrapAsync(exportAttendeesCSV));
router.patch('/:id/attendance', requireEventAdmin, validateUpdateAttendance, WrapAsync(updateAttendance));

export default router;
