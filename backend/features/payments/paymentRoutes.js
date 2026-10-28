import express from 'express';
import {
  submitPaymentProof,
  getPaymentScreenshot,
  getAllPaymentsAdmin,
  reviewPaymentProof,
} from './paymentController.js';
import { validateSubmitProof, validateVerifyPayment } from './validatePayment.js';
import { authMiddleware, requireEventAdmin } from '../../middleware/authMiddleware.js';
import { memoryUpload } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.post(
  '/submit-proof',
  authMiddleware,
  memoryUpload.single('receipt'),
  validateSubmitProof,
  WrapAsync(submitPaymentProof)
);

router.get('/screenshot/:id', authMiddleware, WrapAsync(getPaymentScreenshot));

// Admin routes (Superadmin, President)
router.get('/admin/all', requireEventAdmin, WrapAsync(getAllPaymentsAdmin));
router.patch('/admin/:id/verify', requireEventAdmin, validateVerifyPayment, WrapAsync(reviewPaymentProof));

export default router;
