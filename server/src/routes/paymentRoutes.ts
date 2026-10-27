import { Router } from 'express';
import multer from 'multer';
import {
  submitPaymentProof,
  getMyPayments,
  getAllPaymentsAdmin,
  getPaymentScreenshot,
  reviewPaymentProof,
} from '../controllers/paymentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) or PDF receipts are allowed'));
    }
  },
});

const router = Router();

// Student routes
router.post('/submit-proof', authenticate, upload.single('screenshot'), submitPaymentProof);
router.get('/my', authenticate, getMyPayments);

// Secure screenshot viewer (student owner or admin)
router.get('/screenshot/:id', authenticate, getPaymentScreenshot);

// Admin-only verification routes
router.get('/admin/all', authenticate, requireAdmin, getAllPaymentsAdmin);
router.patch('/admin/:id/verify', authenticate, requireAdmin, reviewPaymentProof);

export default router;
