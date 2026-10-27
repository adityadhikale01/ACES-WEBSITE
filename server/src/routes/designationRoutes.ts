import { Router } from 'express';
import {
  getDesignations,
  getAllDesignationsAdmin,
  createDesignation,
  updateDesignation,
  retireDesignation,
  designationSchema,
} from '../controllers/designationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getDesignations);

// Admin-only routes
router.get('/admin/all', authenticate, requireAdmin, getAllDesignationsAdmin);
router.post('/', authenticate, requireAdmin, validate(designationSchema), createDesignation);
router.put('/:id', authenticate, requireAdmin, validate(designationSchema.partial()), updateDesignation);
router.delete('/:id', authenticate, requireAdmin, retireDesignation);

export default router;
