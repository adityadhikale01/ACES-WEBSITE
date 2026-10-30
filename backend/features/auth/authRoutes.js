import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  refresh,
  updateProfile,
  uploadProfilePhoto,
  changePassword,
} from './authController.js';
import { validateRegister, validateLogin } from './validateAuth.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { imageUpload } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.post('/register', validateRegister, WrapAsync(register));
router.post('/login', validateLogin, WrapAsync(login));
router.get('/me', authMiddleware, WrapAsync(getMe));
router.put('/profile', authMiddleware, WrapAsync(updateProfile));
router.post('/profile-photo', authMiddleware, imageUpload.any(), WrapAsync(uploadProfilePhoto));
router.put('/change-password', authMiddleware, WrapAsync(changePassword));
router.post('/logout', WrapAsync(logout));
router.get('/refresh', WrapAsync(refresh));

export default router;
