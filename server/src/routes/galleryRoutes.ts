import { Router } from 'express';
import {
  getGallery,
  addGalleryItem,
  deleteGalleryItem,
  gallerySchema,
} from '../controllers/galleryController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getGallery);

// Admin endpoints
router.post('/', authenticate, requireAdmin, validate(gallerySchema), addGalleryItem);
router.delete('/:id', authenticate, requireAdmin, deleteGalleryItem);

export default router;
