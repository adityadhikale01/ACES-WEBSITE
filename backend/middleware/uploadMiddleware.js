import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

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

export const uploadMedia = multer({
  storage: cloudinaryStorage || localDiskStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are supported'), false);
    }
  },
});

// Memory storage for payment proof screenshot processing & encryption
export const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image receipts (PNG, JPG, WEBP) are accepted'), false);
    }
  },
});
