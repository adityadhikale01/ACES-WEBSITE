import express from 'express';
import {
  submitContact,
  getAllMessages,
  markResolved,
} from './contactController.js';
import { requireContactAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.post('/', WrapAsync(submitContact));

// Admin routes (Superadmin, President)
router.get('/', requireContactAdmin, WrapAsync(getAllMessages));
router.patch('/:id', requireContactAdmin, WrapAsync(markResolved));
router.patch('/:id/resolve', requireContactAdmin, WrapAsync(markResolved));

export default router;
