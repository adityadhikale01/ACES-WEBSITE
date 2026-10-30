import express from 'express';
import {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
} from './membershipController.js';
import { authMiddleware, optionalAuth, requireMembershipAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.post('/', optionalAuth, WrapAsync(submitApplication));
router.get('/my', authMiddleware, WrapAsync(getMyApplication));

// Admin routes (Superadmin, President)
router.get('/', requireMembershipAdmin, WrapAsync(getAllApplications));
router.get('/all', requireMembershipAdmin, WrapAsync(getAllApplications));
router.patch('/:id/review', requireMembershipAdmin, WrapAsync(reviewApplication));

export default router;
