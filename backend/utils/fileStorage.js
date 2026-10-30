import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 2 levels up from backend/utils/
const projectRoot = path.resolve(__dirname, '../..');

export async function saveUploadedFile(file, subfolder = 'branding', customFilename = null) {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // 1. If already uploaded via Cloudinary storage (multer-storage-cloudinary)
  if (file.path && file.path.startsWith('http')) {
    return file.path;
  }

  const ext = path.extname(file.originalname || '.jpg') || '.jpg';
  const cleanCustom = customFilename ? customFilename.replace(/[^a-zA-Z0-9_-]/g, '_') : null;

  // 2. Try Cloudinary if configured and buffer is present
  if (isCloudinaryConfigured && file.buffer) {
    try {
      const publicId = cleanCustom ? `${cleanCustom}_${Date.now()}` : undefined;
      const result = await uploadBufferToCloudinary(file.buffer, `aces_kbtcoe/${subfolder}`, { public_id: publicId });
      if (result && result.secure_url) {
        return result.secure_url;
      }
    } catch (err) {
      console.warn('[Cloudinary] Upload failed, falling back to local disk:', err.message);
    }
  }

  // 3. Local disk fallback
  const filename = cleanCustom
    ? `${cleanCustom}${ext}`
    : `${subfolder}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  // Save to both root uploads and backend uploads for maximum compatibility
  const rootTargetDir = path.resolve(projectRoot, `uploads/public/${subfolder}`);
  const backendTargetDir = path.resolve(projectRoot, `backend/uploads/public/${subfolder}`);

  [rootTargetDir, backendTargetDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  if (file.buffer) {
    fs.writeFileSync(path.join(rootTargetDir, filename), file.buffer);
    try {
      fs.writeFileSync(path.join(backendTargetDir, filename), file.buffer);
    } catch {}
  } else if (file.path && fs.existsSync(file.path)) {
    fs.copyFileSync(file.path, path.join(rootTargetDir, filename));
    try {
      fs.copyFileSync(file.path, path.join(backendTargetDir, filename));
    } catch {}
  }

  return `/uploads/public/${subfolder}/${filename}`;
}
