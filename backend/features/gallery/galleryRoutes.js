import express from 'express';
import {
  getAllAlbums,
  getAllAlbumsAdmin,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  uploadMediaToAlbum,
  deleteMediaFromAlbum,
  getLegacyGallery,
} from './galleryController.js';
import { requireEventAdmin } from '../../middleware/authMiddleware.js';
import { uploadMedia } from '../../middleware/uploadMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/albums', WrapAsync(getAllAlbums));
router.get('/admin/all', requireEventAdmin, WrapAsync(getAllAlbumsAdmin));
router.get('/albums/:id', WrapAsync(getAlbumById));
router.get('/legacy', WrapAsync(getLegacyGallery));

// Admin routes (Superadmin, President)
router.post('/albums', requireEventAdmin, WrapAsync(createAlbum));
router.put('/albums/:id', requireEventAdmin, WrapAsync(updateAlbum));
router.delete('/albums/:id', requireEventAdmin, WrapAsync(deleteAlbum));
router.post('/albums/:albumId/media', requireEventAdmin, uploadMedia.single('media'), WrapAsync(uploadMediaToAlbum));
router.delete('/albums/:albumId/media/:mediaId', requireEventAdmin, WrapAsync(deleteMediaFromAlbum));

export default router;
