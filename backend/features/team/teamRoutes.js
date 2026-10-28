import express from 'express';
import {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
  reorderMembers,
  uploadTeamPhoto,
  getAllDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from './teamController.js';
import {
  validateCreateMember,
  validateUpdateMember,
  validateDesignation,
} from './validateTeam.js';
import { requireTeamAdmin } from '../../middleware/authMiddleware.js';
import { memoryUpload } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/', WrapAsync(getAllMembers));
router.get('/designations', WrapAsync(getAllDesignations));

// Team Admin routes (Superadmin, President)
router.post('/upload-photo', requireTeamAdmin, memoryUpload.single('photo'), WrapAsync(uploadTeamPhoto));
router.post('/', requireTeamAdmin, validateCreateMember, WrapAsync(createMember));
router.put('/:id', requireTeamAdmin, validateUpdateMember, WrapAsync(updateMember));
router.delete('/:id', requireTeamAdmin, WrapAsync(deleteMember));
router.post('/reorder', requireTeamAdmin, WrapAsync(reorderMembers));

// Designation Admin routes
router.post('/designations', requireTeamAdmin, validateDesignation, WrapAsync(createDesignation));
router.put('/designations/:id', requireTeamAdmin, validateDesignation, WrapAsync(updateDesignation));
router.delete('/designations/:id', requireTeamAdmin, WrapAsync(deleteDesignation));

export default router;
