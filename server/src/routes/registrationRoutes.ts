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
import { authenticate, requireEventAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', authenticate, validate(registerEventSchema), registerForEvent);
router.delete('/:id', authenticate, cancelRegistration);
router.get('/my', authenticate, getMyRegistrations);

// Event Admin endpoints (SUPER_ADMIN, ADMIN, PRESIDENT)
router.get('/event/:eventId', authenticate, requireEventAdmin, getEventAttendees);
router.get('/event/:eventId/export', authenticate, requireEventAdmin, exportAttendeesCSV);
router.patch('/:id/attendance', authenticate, requireEventAdmin, updateAttendance);

export default router;
