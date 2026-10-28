import express from 'express';
import {
  getAllAlbums,
  getAlbumBySlug,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addMediaToAlbum,
  deleteMediaItem,
} from './galleryController.js';
import { validateCreateAlbum, validateAddMedia } from './validateGallery.js';
import { requireEventAdmin } from '../../middleware/authMiddleware.js';
import { WrapAsync } from '../../utils/WrapAsync.js';

const router = express.Router();

router.get('/albums', WrapAsync(getAllAlbums));
router.get('/albums/:slug', WrapAsync(getAlbumBySlug));

// Admin routes (Superadmin, President)
router.post('/albums', requireEventAdmin, validateCreateAlbum, WrapAsync(createAlbum));
router.put('/albums/:id', requireEventAdmin, WrapAsync(updateAlbum));
router.delete('/albums/:id', requireEventAdmin, WrapAsync(deleteAlbum));
router.post('/media', requireEventAdmin, validateAddMedia, WrapAsync(addMediaToAlbum));
router.delete('/media/:id', requireEventAdmin, WrapAsync(deleteMediaItem));

export default router;
