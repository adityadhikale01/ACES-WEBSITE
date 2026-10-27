import { Router } from 'express';
import multer from 'multer';
import {
  getGalleryAlbums,
  getAllAlbumsAdmin,
  getAlbumById,
  getEventGallery,
  createAlbum,
  uploadMediaToAlbum,
  updateAlbum,
  deleteAlbum,
  deleteMediaFromAlbum,
  getGallery,
} from '../controllers/galleryController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video/image uploads
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are supported for the event gallery'));
    }
  },
});

const router = Router();

// Public routes
router.get('/albums', getGalleryAlbums);
router.get('/albums/:id', getAlbumById);
router.get('/event/:eventId', getEventGallery);
router.get('/legacy', getGallery);
router.get('/', getGalleryAlbums); // Default gallery returns albums

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, getAllAlbumsAdmin);
router.post('/albums', authenticate, requireAdmin, createAlbum);
router.post(
  '/albums/:id/media',
  authenticate,
  requireAdmin,
  upload.single('mediaFile'),
  uploadMediaToAlbum
);
router.put('/albums/:id', authenticate, requireAdmin, updateAlbum);
router.delete('/albums/:id', authenticate, requireAdmin, deleteAlbum);
router.delete('/albums/:albumId/media/:mediaId', authenticate, requireAdmin, deleteMediaFromAlbum);

export default router;
