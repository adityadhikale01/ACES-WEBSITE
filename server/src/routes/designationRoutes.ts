import { Router } from 'express';
import {
  getDesignations,
  getAllDesignationsAdmin,
  createDesignation,
  updateDesignation,
  retireDesignation,
  designationSchema,
} from '../controllers/designationController.js';
import { authenticate, requireTeamAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getDesignations);

// Designation Admin routes (SUPER_ADMIN, ADMIN, PRESIDENT)
router.get('/admin/all', authenticate, requireTeamAdmin, getAllDesignationsAdmin);
router.post('/', authenticate, requireTeamAdmin, validate(designationSchema), createDesignation);
router.put('/:id', authenticate, requireTeamAdmin, validate(designationSchema.partial()), updateDesignation);
router.delete('/:id', authenticate, requireTeamAdmin, retireDesignation);

export default router;
