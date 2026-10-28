import { Request, Response } from 'express';
import { SiteContent } from '../models/SiteContent.js';
import { AuthRequest } from '../middleware/auth.js';
import { uploadGalleryMedia } from '../services/storageService.js';

export const getContentByKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const item = await SiteContent.findOne({ key });
    if (!item) {
      // Return default branding if not set
      if (key === 'branding') {
        res.json({
          success: true,
          key: 'branding',
          data: {
            groupPhotoUrl: '/assets/aces-team.jpg',
            logoUrl: '/assets/aces-logo.jpeg',
            heroBannerUrl: '',
            headline: 'Where Ideas Meet Innovation.',
            subtitle:
              'Discover departmental activities, technical workshops, learning sessions, and the people who make ACES KBTCOE happen.',
            contactEmail: 'aces.kbtcoe@gmail.com',
            contactPhone: '+91 253 2571439',
            campusLocation: 'Department of Computer Engineering, NDMVP KBTCOE, Nashik - 422013',
          },
        });
        return;
      }
      res.status(404).json({ success: false, message: `Content for ${key} not found` });
      return;
    }
    res.json({ success: true, key, data: item.data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContentByKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { data } = req.body;

    const item = await SiteContent.findOneAndUpdate(
      { key },
      { data, updatedBy: req.user?.fullName || 'ACES Superadmin' },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: `Content for ${key} updated successfully!`, item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadContentImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Content image file is required' });
      return;
    }
    const result = await uploadGalleryMedia(req.file, 'aces_kbtcoe_content');
    res.json({ success: true, url: result.url, storageProvider: result.storageProvider });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
