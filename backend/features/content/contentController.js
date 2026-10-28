import SiteContent from './contentModel.js';
import { AppError } from '../../utils/AppError.js';
import path from 'path';
import fs from 'fs';

export const getContentByKey = async (req, res) => {
  const { key } = req.params;
  let content = await SiteContent.findOne({ key });

  if (!content) {
    if (key === 'branding') {
      content = {
        key: 'branding',
        data: {
          clubName: 'ACES KBTCOE',
          fullName: "Association of Computer Engineering Students'",
          tagline: 'Where Ideas Meet Innovation.',
          logoUrl: '/assets/aces-logo.jpeg',
          groupPhotoUrl: '/assets/aces-team.jpg',
          department: 'Department of Computer Engineering',
          college: "MVPS's K.B.T. College of Engineering, Nashik",
        },
      };
    } else {
      content = { key, data: {} };
    }
  }

  res.status(200).json({
    success: true,
    key: content.key,
    data: content.data,
  });
};

export const updateContentByKey = async (req, res) => {
  const { key } = req.params;
  const data = req.validatedBody?.data || req.body?.data || req.body;

  const content = await SiteContent.findOneAndUpdate(
    { key },
    { data, updatedBy: req.userId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    message: `Content for ${key} updated successfully`,
    data: content.data,
  });
};

export const uploadContentImage = async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No image uploaded', 400));
  }

  let imageUrl = '';
  if (req.file.path && req.file.path.startsWith('http')) {
    imageUrl = req.file.path;
  } else if (req.file.buffer) {
    const uploadDir = path.resolve(process.cwd(), 'uploads/public/branding');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `branding-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(req.file.originalname || '.jpg')}`;
    fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    imageUrl = `/uploads/public/branding/${filename}`;
  } else if (req.file.filename) {
    imageUrl = `/uploads/public/media/${req.file.filename}`;
  }

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    imageUrl,
    url: imageUrl,
  });
};
