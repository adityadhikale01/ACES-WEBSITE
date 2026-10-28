import { Router } from 'express';
import multer from 'multer';
import {
  getTeam,
  getAllTeamAdmin,
  addTeamMember,
  updateTeamMember,
  reorderTeamMembers,
  deleteTeamMember,
  uploadTeamPhoto,
  teamMemberSchema,
} from '../controllers/teamController.js';
import { authenticate, requireTeamAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed for team photos'));
    }
  },
});

const router = Router();

router.get('/', getTeam);

// Team Admin endpoints (SUPER_ADMIN, ADMIN, PRESIDENT)
router.get('/admin/all', authenticate, requireTeamAdmin, getAllTeamAdmin);
router.post('/upload-photo', authenticate, requireTeamAdmin, upload.single('photo'), uploadTeamPhoto);
router.put('/reorder', authenticate, requireTeamAdmin, reorderTeamMembers);
router.patch('/reorder', authenticate, requireTeamAdmin, reorderTeamMembers);
router.post('/', authenticate, requireTeamAdmin, validate(teamMemberSchema), addTeamMember);
router.put('/:id', authenticate, requireTeamAdmin, validate(teamMemberSchema.partial()), updateTeamMember);
router.delete('/:id', authenticate, requireTeamAdmin, deleteTeamMember);

export default router;
