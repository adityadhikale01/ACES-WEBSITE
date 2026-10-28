import { Router } from 'express';
import {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
  applicationSchema,
} from '../controllers/membershipController.js';
import { authenticate, optionalAuth, requireMembershipAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', optionalAuth, validate(applicationSchema), submitApplication);
router.get('/my', authenticate, getMyApplication);

// Membership Review endpoints (SUPER_ADMIN, ADMIN, PRESIDENT)
router.get('/all', authenticate, requireMembershipAdmin, getAllApplications);
router.patch('/:id/review', authenticate, requireMembershipAdmin, reviewApplication);

export default router;
