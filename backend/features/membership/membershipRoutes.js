import express from 'express';
import {
  submitApplication,
  getAllApplications,
  reviewApplication,
} from './membershipController.js';
import {
  validateApplyMembership,
  validateReviewMembership,
} from './validateMembership.js';
import { requireMembershipAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.post('/', validateApplyMembership, WrapAsync(submitApplication));

// Admin routes (Superadmin, President)
router.get('/', requireMembershipAdmin, WrapAsync(getAllApplications));
router.patch('/:id/review', requireMembershipAdmin, validateReviewMembership, WrapAsync(reviewApplication));

export default router;
