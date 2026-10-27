import { Router } from 'express';
import {
  getTeam,
  getAllTeamAdmin,
  addTeamMember,
  updateTeamMember,
  reorderTeamMembers,
  deleteTeamMember,
  teamMemberSchema,
} from '../controllers/teamController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getTeam);

// Admin endpoints
router.get('/admin/all', authenticate, requireAdmin, getAllTeamAdmin);
router.put('/reorder', authenticate, requireAdmin, reorderTeamMembers);
router.post('/', authenticate, requireAdmin, validate(teamMemberSchema), addTeamMember);
router.put('/:id', authenticate, requireAdmin, validate(teamMemberSchema.partial()), updateTeamMember);
router.delete('/:id', authenticate, requireAdmin, deleteTeamMember);

export default router;
