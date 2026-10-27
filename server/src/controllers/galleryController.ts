import { Request, Response } from 'express';
import { z } from 'zod';
import { GalleryItem } from '../models/GalleryItem.js';

export const gallerySchema = z.object({
  title: z.string().min(2, 'Title is required'),
  caption: z.string().optional(),
  mediaUrl: z.string().min(1, 'Media URL is required'),
  category: z.enum(['FLAGSHIP', 'WORKSHOP', 'COMPETITION', 'TEAM', 'COMMUNITY']).default('WORKSHOP'),
  date: z.string().or(z.date()).optional(),
  displayOrder: z.number().default(0),
  featured: z.boolean().default(false),
});

export const getGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: any = {};
    if (category && category !== 'ALL') {
      filter.category = category;
    }
    const items = await GalleryItem.find(filter).sort({ displayOrder: 1, date: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await GalleryItem.create(req.body);
    res.status(201).json({ success: true, message: 'Gallery item added', item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await GalleryItem.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }
    res.json({ success: true, message: 'Item deleted from gallery' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
