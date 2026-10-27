import { Router } from 'express';
import {
  submitContact,
  getContactMessages,
  markMessageRead,
  contactSchema,
} from '../controllers/contactController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', validate(contactSchema), submitContact);

// Admin endpoints
router.get('/', authenticate, requireAdmin, getContactMessages);
router.patch('/:id', authenticate, requireAdmin, markMessageRead);

export default router;
