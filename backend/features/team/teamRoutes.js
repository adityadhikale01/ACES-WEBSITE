import express from 'express';
import {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
  reorderMembers,
  uploadTeamPhoto,
} from './teamController.js';
import { requireTeamAdmin } from '../../middleware/authMiddleware.js';
import { imageUpload } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/', WrapAsync(getAllMembers));
router.get('/admin/all', requireTeamAdmin, WrapAsync(getAllMembers));

// Flexible photo upload for team members ('photo', 'image', 'file')
const flexiblePhotoUpload = (req, res, next) => {
  imageUpload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files.find((f) =>
        ['photo', 'image', 'file', 'avatar'].includes(f.fieldname)
      ) || req.files[0];
    }
    next();
  });
};

// Team Admin routes (Superadmin, President)
router.post('/upload-photo', requireTeamAdmin, flexiblePhotoUpload, WrapAsync(uploadTeamPhoto));
router.post('/', requireTeamAdmin, WrapAsync(createMember));
router.put('/:id', requireTeamAdmin, WrapAsync(updateMember));
router.delete('/:id', requireTeamAdmin, WrapAsync(deleteMember));
router.patch('/reorder', requireTeamAdmin, WrapAsync(reorderMembers));
router.post('/reorder', requireTeamAdmin, WrapAsync(reorderMembers));

export default router;
