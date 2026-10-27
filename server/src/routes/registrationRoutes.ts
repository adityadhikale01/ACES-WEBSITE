import { Router } from 'express';
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees,
  exportAttendeesCSV,
  updateAttendance,
  registerEventSchema,
} from '../controllers/registrationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', authenticate, validate(registerEventSchema), registerForEvent);
router.delete('/:id', authenticate, cancelRegistration);
router.get('/my', authenticate, getMyRegistrations);

// Admin endpoints
router.get('/event/:eventId', authenticate, requireAdmin, getEventAttendees);
router.get('/event/:eventId/export', authenticate, requireAdmin, exportAttendeesCSV);
router.patch('/:id/attendance', authenticate, requireAdmin, updateAttendance);

export default router;
