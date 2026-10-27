import { Router } from 'express';
import {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
  applicationSchema,
} from '../controllers/membershipController.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', optionalAuth, validate(applicationSchema), submitApplication);
router.get('/my', authenticate, getMyApplication);

// Admin endpoints
router.get('/all', authenticate, requireAdmin, getAllApplications);
router.patch('/:id/review', authenticate, requireAdmin, reviewApplication);

export default router;
