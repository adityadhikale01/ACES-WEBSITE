import { Router } from 'express';
import {
  getTeam,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  teamMemberSchema,
} from '../controllers/teamController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getTeam);

// Admin endpoints
router.post('/', authenticate, requireAdmin, validate(teamMemberSchema), addTeamMember);
router.put('/:id', authenticate, requireAdmin, validate(teamMemberSchema.partial()), updateTeamMember);
router.delete('/:id', authenticate, requireAdmin, deleteTeamMember);

export default router;
