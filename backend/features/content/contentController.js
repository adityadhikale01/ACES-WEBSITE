import SiteContent from './contentModel.js';
import { AppError } from '../../utils/AppError.js';
import { saveUploadedFile } from '../../utils/fileStorage.js';

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
  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return next(new AppError('No image uploaded. Please attach an image file.', 400));
  }

  try {
    const imageUrl = await saveUploadedFile(file, 'branding');

    // Optionally auto-update branding if type parameter is provided
    const type = req.query.type || req.body?.type;
    if (type === 'groupPhoto' || type === 'logo') {
      const field = type === 'groupPhoto' ? 'groupPhotoUrl' : 'logoUrl';
      const existing = await SiteContent.findOne({ key: 'branding' });
      const currentData = existing?.data || {
        clubName: 'ACES KBTCOE',
        fullName: "Association of Computer Engineering Students'",
        tagline: 'Where Ideas Meet Innovation.',
        logoUrl: '/assets/aces-logo.jpeg',
        groupPhotoUrl: '/assets/aces-team.jpg',
      };
      currentData[field] = imageUrl;
      await SiteContent.findOneAndUpdate(
        { key: 'branding' },
        { data: currentData, updatedBy: req.userId },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      url: imageUrl,
    });
  } catch (err) {
    next(err);
  }
};
