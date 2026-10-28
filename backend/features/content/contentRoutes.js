import express from 'express';
import {
  getContentByKey,
  updateContentByKey,
  uploadContentImage,
} from './contentController.js';
import { validateUpdateContent } from './validateContent.js';
import { requireSuperAdmin } from '../../middleware/authMiddleware.js';
import { memoryUpload } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/:key', WrapAsync(getContentByKey));

// Restricted strictly to Superadmin
router.post(
  '/upload-image',
  requireSuperAdmin,
  memoryUpload.single('image'),
  WrapAsync(uploadContentImage)
);
router.put('/:key', requireSuperAdmin, validateUpdateContent, WrapAsync(updateContentByKey));

export default router;
