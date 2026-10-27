import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary if environment variables are present
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET)
);

if (isCloudinaryConfigured) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ url: process.env.CLOUDINARY_URL });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

// Local storage paths
const ROOT_DIR = process.cwd();
const UPLOAD_BASE_DIR = path.join(ROOT_DIR, 'uploads');
const PRIVATE_PAYMENTS_DIR = path.join(UPLOAD_BASE_DIR, 'private', 'payments');
const PUBLIC_MEDIA_DIR = path.join(UPLOAD_BASE_DIR, 'public', 'media');

// Ensure local folders exist
[PRIVATE_PAYMENTS_DIR, PUBLIC_MEDIA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export interface UploadResult {
  url: string;
  publicId?: string;
  storageProvider: 'cloudinary' | 'gdrive' | 'local_private' | 'local_public';
  mimeType?: string;
  size?: number;
}

/**
 * Upload private payment screenshot.
 * Note: Payment screenshots must NEVER be publicly exposed on a CDN.
 * They are stored securely in local private storage (or private Drive folder)
 * and streamed only via authenticated backend endpoints with IDOR protection.
 */
export const storePrivatePaymentScreenshot = async (
  file: Express.Multer.File
): Promise<UploadResult> => {
  const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
  const safeFilename = `payment_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${extension}`;
  const targetPath = path.join(PRIVATE_PAYMENTS_DIR, safeFilename);

  await fs.promises.writeFile(targetPath, file.buffer);

  return {
    url: `/api/v1/payments/screenshot/${safeFilename}`,
    publicId: safeFilename,
    storageProvider: 'local_private',
    mimeType: file.mimetype,
    size: file.size,
  };
};

/**
 * Retrieve path of a private payment screenshot
 */
export const getPrivateScreenshotPath = (filename: string): string | null => {
  const safeName = path.basename(filename); // IDOR path traversal protection
  const filePath = path.join(PRIVATE_PAYMENTS_DIR, safeName);
  return fs.existsSync(filePath) ? filePath : null;
};

/**
 * Upload event gallery images and videos.
 * Uses Cloudinary for rich media CDN delivery if configured,
 * otherwise falls back seamlessly to local persistent storage.
 */
export const uploadGalleryMedia = async (
  file: Express.Multer.File,
  folder: string = 'aces_kbtcoe_gallery'
): Promise<UploadResult> => {
  const isVideo = file.mimetype.startsWith('video/');

  if (isCloudinaryConfigured) {
    try {
      return await new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: isVideo ? 'video' : 'image',
            transformation: isVideo ? undefined : [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary upload returned null'));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              storageProvider: 'cloudinary',
              mimeType: file.mimetype,
              size: result.bytes,
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (err: any) {
      console.warn('[Storage] Cloudinary upload failed, falling back to local storage:', err.message);
    }
  }

  // Local fallback storage for public gallery items
  const extension = path.extname(file.originalname).toLowerCase() || (isVideo ? '.mp4' : '.jpg');
  const safeFilename = `gallery_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${extension}`;
  const targetPath = path.join(PUBLIC_MEDIA_DIR, safeFilename);

  await fs.promises.writeFile(targetPath, file.buffer);

  return {
    url: `/uploads/public/media/${safeFilename}`,
    publicId: safeFilename,
    storageProvider: 'local_public',
    mimeType: file.mimetype,
    size: file.size,
  };
};

export const getStorageStatus = () => ({
  cloudinary: isCloudinaryConfigured,
  localUploadsDir: UPLOAD_BASE_DIR,
  gdriveConfigured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
});
