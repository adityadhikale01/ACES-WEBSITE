import { Request, Response } from 'express';
import { SiteContent } from '../models/SiteContent.js';
import { AuthRequest } from '../middleware/auth.js';

export const getContentByKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const item = await SiteContent.findOne({ key });
    if (!item) {
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
      { data, updatedBy: req.user?.fullName || 'ACES Admin' },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: `Content for ${key} updated successfully!`, item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
