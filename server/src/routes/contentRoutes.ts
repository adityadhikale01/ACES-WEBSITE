import { Router } from 'express';
import { getContentByKey, updateContentByKey } from '../controllers/contentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/:key', getContentByKey);
router.put('/:key', authenticate, requireAdmin, updateContentByKey);

export default router;
