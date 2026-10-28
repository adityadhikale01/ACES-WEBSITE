import { Router } from 'express';
import multer from 'multer';
import {
  getContentByKey,
  updateContentByKey,
  uploadContentImage,
} from '../controllers/contentController.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for high-res group photos
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  },
});

const router = Router();

router.get('/:key', getContentByKey);

// Superadmin-only website content management (change group photo, logo, branding, etc.)
router.post(
  '/upload-image',
  authenticate,
  requireSuperAdmin,
  upload.single('image'),
  uploadContentImage
);
router.put('/:key', authenticate, requireSuperAdmin, updateContentByKey);

export default router;
