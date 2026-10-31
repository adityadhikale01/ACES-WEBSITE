import express from 'express';
import {
  sendMembershipOtp,
  verifyMembershipOtp,
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
  exportApplicationsCSV,
} from './membershipController.js';
import { authMiddleware, optionalAuth, requireMembershipAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

// OTP verification for student applicants
router.post('/send-otp', WrapAsync(sendMembershipOtp));
router.post('/verify-otp', WrapAsync(verifyMembershipOtp));

// Student application submission
router.post('/', optionalAuth, WrapAsync(submitApplication));
router.get('/my', authMiddleware, WrapAsync(getMyApplication));

// Admin routes (Superadmin, President)
router.get('/export', requireMembershipAdmin, WrapAsync(exportApplicationsCSV));
router.get('/', requireMembershipAdmin, WrapAsync(getAllApplications));
router.get('/all', requireMembershipAdmin, WrapAsync(getAllApplications));
router.patch('/:id/review', requireMembershipAdmin, WrapAsync(reviewApplication));

export default router;
