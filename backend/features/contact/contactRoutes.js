import express from 'express';
import {
  submitContact,
  getAllMessages,
  markResolved,
} from './contactController.js';
import { validateContact } from './validateContact.js';
import { requireContactAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.post('/', validateContact, WrapAsync(submitContact));

// Admin routes (Superadmin, President)
router.get('/', requireContactAdmin, WrapAsync(getAllMessages));
router.patch('/:id/resolve', requireContactAdmin, WrapAsync(markResolved));

export default router;
