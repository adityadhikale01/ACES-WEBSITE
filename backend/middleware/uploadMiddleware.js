import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { AppError } from '../utils/AppError.js';

const localUploadsDir = path.resolve(process.cwd(), 'uploads/public/media');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const cloudinaryStorage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'aces_kbtcoe/media',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4'],
      },
    })
  : null;

// Multi-media uploader for Gallery
export const uploadMedia = multer({
  storage: cloudinaryStorage || localDiskStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image and video files are supported', 400), false);
    }
  },
});

// Dedicated high-capacity image uploader (Team Photos, Group Photos, Logos, CMS branding)
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for high-res DSLR and smartphone photos
  fileFilter: (req, file, cb) => {
    const isImageMime = file.mimetype.startsWith('image/');
    const isImageExt = /\.(jpg|jpeg|png|webp|gif|svg|avif|heic|bmp)$/i.test(file.originalname || '');
    if (isImageMime || isImageExt) {
      cb(null, true);
    } else {
      cb(new AppError('Only valid image files (JPG, PNG, WEBP, GIF, SVG, AVIF) are accepted', 400), false);
    }
  },
});

// Memory storage for payment proof screenshot processing & encryption
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isImageMime = file.mimetype.startsWith('image/');
    const isImageExt = /\.(jpg|jpeg|png|webp|pdf)$/i.test(file.originalname || '');
    if (isImageMime || isImageExt) {
      cb(null, true);
    } else {
      cb(new AppError('Only image receipts (PNG, JPG, WEBP) are accepted', 400), false);
    }
  },
});
