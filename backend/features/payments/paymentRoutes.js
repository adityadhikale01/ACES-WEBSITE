import express from 'express';
import {
  submitPaymentProof,
  getMyPayments,
  getPaymentScreenshot,
  getAllPaymentsAdmin,
  reviewPaymentProof,
} from './paymentController.js';
import { authMiddleware, requireEventAdmin } from '../../middleware/authMiddleware.js';
import { memoryUpload } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.post(
  '/submit-proof',
  authMiddleware,
  memoryUpload.single('receipt'),
  WrapAsync(submitPaymentProof)
);

router.get('/my', authMiddleware, WrapAsync(getMyPayments));
router.get('/screenshot/:id', authMiddleware, WrapAsync(getPaymentScreenshot));

// Admin routes (Superadmin, President)
router.get('/admin/all', requireEventAdmin, WrapAsync(getAllPaymentsAdmin));
router.patch('/admin/:id/verify', requireEventAdmin, WrapAsync(reviewPaymentProof));

export default router;
