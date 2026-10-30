import express from 'express';
import {
  getAllDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from './teamController.js';
import { requireTeamAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/', WrapAsync(getAllDesignations));
router.get('/admin/all', requireTeamAdmin, WrapAsync(getAllDesignations));
router.post('/', requireTeamAdmin, WrapAsync(createDesignation));
router.put('/:id', requireTeamAdmin, WrapAsync(updateDesignation));
router.delete('/:id', requireTeamAdmin, WrapAsync(deleteDesignation));

export default router;
