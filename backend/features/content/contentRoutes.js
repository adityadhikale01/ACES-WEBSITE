import express from 'express';
import {
  getContentByKey,
  updateContentByKey,
  uploadContentImage,
  sendTestEmailHandler,
} from './contentController.js';
import { validateUpdateContent } from './validateContent.js';
import { requireSuperAdmin } from '../../middleware/authMiddleware.js';
import { imageUpload } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/:key', WrapAsync(getContentByKey));

// Flexible middleware that seamlessly accepts any image field ('image', 'photo', 'file', 'groupPhoto', 'logo')
const flexibleImageUpload = (req, res, next) => {
  imageUpload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files.find((f) =>
        ['image', 'photo', 'file', 'groupPhoto', 'logo'].includes(f.fieldname)
      ) || req.files[0];
    }
    next();
  });
};

// Website Branding & Group Photo Uploader (Restricted strictly to Superadmin)
router.post(
  '/upload-image',
  requireSuperAdmin,
  flexibleImageUpload,
  WrapAsync(uploadContentImage)
);

// Send test email (Superadmin only)
router.post('/send-test-email', requireSuperAdmin, WrapAsync(sendTestEmailHandler));

router.put('/:key', requireSuperAdmin, validateUpdateContent, WrapAsync(updateContentByKey));

export default router;
