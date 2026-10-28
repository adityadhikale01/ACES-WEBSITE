import { Router } from 'express';
import {
  submitContact,
  getContactMessages,
  markMessageRead,
  contactSchema,
} from '../controllers/contactController.js';
import { authenticate, requireContactAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/', validate(contactSchema), submitContact);

// Messages inbox endpoints (SUPER_ADMIN, ADMIN, PRESIDENT)
router.get('/', authenticate, requireContactAdmin, getContactMessages);
router.patch('/:id', authenticate, requireContactAdmin, markMessageRead);

export default router;
