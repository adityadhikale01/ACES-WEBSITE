import express from 'express';
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventAttendees,
  updateAttendance,
  exportAttendeesCSV,
} from './registrationController.js';
import { authMiddleware, optionalAuth, requireEventAdmin } from '../../middleware/authMiddleware.js';
import { imageUpload } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

const flexibleRegistrationUpload = (req, res, next) => {
  // If content-type is multipart/form-data, handle with multer
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    imageUpload.any()(req, res, (err) => {
      if (err) return next(err);
      if (req.files && req.files.length > 0) {
        req.file = req.files.find((f) =>
          ['screenshot', 'paymentScreenshot', 'receipt', 'image', 'proof'].includes(f.fieldname)
        ) || req.files[0];
      }
      next();
    });
  } else {
    next();
  }
};

// Event registration endpoint (Works BOTH with and without login!)
router.post('/', optionalAuth, flexibleRegistrationUpload, WrapAsync(registerForEvent));
router.delete('/:id', authMiddleware, WrapAsync(cancelRegistration));
router.get('/my', authMiddleware, WrapAsync(getMyRegistrations));

// Admin routes
router.get('/event/:eventId', requireEventAdmin, WrapAsync(getEventAttendees));
router.get('/event/:eventId/export', requireEventAdmin, WrapAsync(exportAttendeesCSV));
router.patch('/:id/attendance', requireEventAdmin, WrapAsync(updateAttendance));

export default router;
